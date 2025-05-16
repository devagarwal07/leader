
'use server';

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, Timestamp, getDoc } from 'firebase/firestore';
import type { User, PointRequest } from './types';
import { z } from 'zod';

// Signup Action
const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['student', 'admin']),
  adminCode: z.string().optional(),
});
type SignupInput = z.infer<typeof SignupSchema>;

export async function signupAction(data: SignupInput) {
  try {
    const validation = SignupSchema.safeParse(data);
    if (!validation.success) {
      return { error: "Invalid input: " + validation.error.errors.map(e => e.message).join(', ') };
    }

    const { name, email, password, role, adminCode } = validation.data;

    if (role === 'admin') {
      // Ensure ADMIN_SIGNUP_CODE is accessed correctly
      const correctAdminCode = process.env.ADMIN_SIGNUP_CODE;
      if (!correctAdminCode) {
        console.error("ADMIN_SIGNUP_CODE is not set in .env file.");
        return { error: 'Admin signup is currently disabled. Configuration error.' };
      }
      if (adminCode !== correctAdminCode) {
        return { error: 'Invalid admin code.' };
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user details in Firestore
    const userDoc: User = {
      uid: user.uid,
      name: name,
      email: user.email,
      role: role,
    };
    await setDoc(doc(db, "users", user.uid), userDoc);

    return { success: true, userId: user.uid };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { error: 'This email address is already in use. Please try logging in or use a different email.' };
    }
    return { error: error.message || 'Signup failed. Please try again.' };
  }
}

// Login Action
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type LoginInput = z.infer<typeof LoginSchema>;

interface LoginSuccessResult {
  success: true;
  userId: string;
  role: User['role'];
}
interface LoginErrorResult {
  success?: false; // Explicitly false or undefined for error
  error: string;
}
type LoginResult = LoginSuccessResult | LoginErrorResult;


export async function loginAction(data: LoginInput): Promise<LoginResult> {
  try {
    const validation = LoginSchema.safeParse(data);
    if (!validation.success) {
      return { error: "Invalid input: " + validation.error.errors.map(e => e.message).join(', ') };
    }
    const { email, password } = validation.data;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseAuthUser = userCredential.user;

    // Fetch user role from Firestore
    const userDocRef = doc(db, "users", firebaseAuthUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // This case should ideally not happen if signup guarantees Firestore doc creation.
      // If it does, it means there's an inconsistency.
      await signOut(auth); // Sign out the user as their profile is incomplete
      return { error: 'User profile not found. Please contact support or try signing up again.' };
    }

    const userData = userDocSnap.data() as User;
    if (!userData.role) {
        await signOut(auth);
        return { error: 'User role not defined. Please contact support.' };
    }

    return { success: true, userId: firebaseAuthUser.uid, role: userData.role };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return { error: 'Invalid email or password. Please try again.' };
    }
    return { error: error.message || 'Login failed. Please check your credentials.' };
  }
}

// Logout Action
export async function logoutAction() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Logout failed.' };
  }
}

// Student: Request Points Action
const RequestPointsSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters.").max(500, "Reason too long."),
  userId: z.string(),
  studentName: z.string(),
});
type RequestPointsInput = z.infer<typeof RequestPointsSchema>;

export async function requestPointsAction(data: RequestPointsInput) {
  try {
    const validation = RequestPointsSchema.safeParse(data);
    if(!validation.success) {
        return { error: "Invalid input: " + validation.error.errors.map(e => e.message).join(', ') };
    }
    const { reason, userId, studentName } = validation.data;

    const newRequest: Omit<PointRequest, 'id' | 'requestedAt'> & { requestedAt: any } = { // Ensure requestedAt type matches serverTimestamp()
      userId,
      studentName,
      reason,
      status: 'pending',
      requestedAt: serverTimestamp(), // This will be converted to Timestamp by Firestore
    };
    const docRef = await addDoc(collection(db, "pointRequests"), newRequest);
    return { success: true, requestId: docRef.id };
  } catch (error: any) {
    return { error: error.message || 'Failed to submit point request.' };
  }
}


// Admin: Fetch Point Requests Action
export async function getPointRequestsAction(status?: 'pending' | 'approved' | 'rejected'): Promise<{ requests?: PointRequest[], error?: string }> {
  try {
    const requestsRef = collection(db, "pointRequests");
    let q;
    if (status) {
      q = query(requestsRef, where("status", "==", status));
    } else {
      q = query(requestsRef);
    }
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            requestedAt: data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : (data.requestedAt ? new Date(data.requestedAt.seconds * 1000).toISOString() : null),
            reviewedAt: data.reviewedAt instanceof Timestamp ? data.reviewedAt.toDate().toISOString() : (data.reviewedAt ? new Date(data.reviewedAt.seconds * 1000).toISOString() : null),
        } as PointRequest;
    });
    return { requests };
  } catch (error: any) {
    console.error("Error in getPointRequestsAction:", error);
    return { error: error.message || 'Failed to fetch point requests.' };
  }
}

// Admin: Approve Point Request Action
const ApproveRequestSchema = z.object({
  requestId: z.string(),
  pointsAwarded: z.coerce.number().min(1, "Points must be at least 1."),
  adminNotes: z.string().optional(),
});
type ApproveRequestInput = z.infer<typeof ApproveRequestSchema>;

export async function approvePointRequestAction(data: ApproveRequestInput) {
  try {
    const validation = ApproveRequestSchema.safeParse(data);
     if(!validation.success) {
        return { error: "Invalid input for approval: " + validation.error.errors.map(e => e.message).join(', ') };
    }
    const { requestId, pointsAwarded, adminNotes } = validation.data;

    const requestRef = doc(db, "pointRequests", requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      pointsAwarded: pointsAwarded,
      adminNotes: adminNotes || "",
      reviewedAt: serverTimestamp(),
    });
    // TODO: Add logic here to find the student's user document by `userId` from the pointRequest,
    // then add an accomplishment to their `accomplishments` subcollection or array,
    // and update their `totalPoints`. This requires fetching the original request to get userId.
    return { success: true };
  } catch (error: any)
 {
    console.error("Error in approvePointRequestAction:", error);
    return { error: error.message || 'Failed to approve point request.' };
  }
}

// Admin: Reject Point Request Action
const RejectRequestSchema = z.object({
  requestId: z.string(),
  adminNotes: z.string().optional(),
});
type RejectRequestInput = z.infer<typeof RejectRequestSchema>;

export async function rejectPointRequestAction(data: RejectRequestInput) {
  try {
     const validation = RejectRequestSchema.safeParse(data);
     if(!validation.success) {
        return { error: "Invalid input for rejection: " + validation.error.errors.map(e => e.message).join(', ') };
    }
    const { requestId, adminNotes } = validation.data;
    const requestRef = doc(db, "pointRequests", requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      adminNotes: adminNotes || "",
      reviewedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error in rejectPointRequestAction:", error);
    return { error: error.message || 'Failed to reject point request.' };
  }
}
