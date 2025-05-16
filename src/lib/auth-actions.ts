
'use server';

import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, Timestamp } from 'firebase/firestore';
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
      if (adminCode !== process.env.ADMIN_SIGNUP_CODE) {
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
    return { error: error.message || 'Signup failed. Please try again.' };
  }
}

// Login Action
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type LoginInput = z.infer<typeof LoginSchema>;

export async function loginAction(data: LoginInput) {
  try {
    const validation = LoginSchema.safeParse(data);
    if (!validation.success) {
      return { error: "Invalid input: " + validation.error.errors.map(e => e.message).join(', ') };
    }
    const { email, password } = validation.data;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
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

    const newRequest: Omit<PointRequest, 'id'> = {
      userId,
      studentName,
      reason,
      status: 'pending',
      requestedAt: serverTimestamp(),
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
    const requests = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Ensure Timestamps are converted if needed, or handle on client
        requestedAt: doc.data().requestedAt instanceof Timestamp ? doc.data().requestedAt.toDate().toISOString() : doc.data().requestedAt,
        reviewedAt: doc.data().reviewedAt instanceof Timestamp ? doc.data().reviewedAt.toDate().toISOString() : doc.data().reviewedAt,
    })) as PointRequest[];
    return { requests };
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch point requests.' };
  }
}

// Admin: Approve Point Request Action
const ApproveRequestSchema = z.object({
  requestId: z.string(),
  pointsAwarded: z.number().min(1, "Points must be at least 1."),
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
    // Note: This action currently does NOT update the student's main point total or accomplishments.
    // That would require fetching the student document and updating it, potentially creating a new accomplishment.
    // This can be added as a next step.
    return { success: true };
  } catch (error: any) {
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
    return { error: error.message || 'Failed to reject point request.' };
  }
}
