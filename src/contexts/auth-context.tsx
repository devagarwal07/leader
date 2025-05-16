
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true); // Start in loading state

  useEffect(() => {
    console.log('[AuthContext] Initializing auth state listener...');
    const unsubscribeAuth = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        console.log(`[AuthContext] Firebase auth state changed. User UID: ${fbUser.uid}`);
        const userDocRef = doc(db, "users", fbUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            console.log('[AuthContext] User document found:', JSON.stringify(userData));
            
            if (!userData.role) {
                console.warn(`[AuthContext] User document for UID: ${fbUser.uid} is MISSING the 'role' field. Access will likely be denied for role-specific pages.`);
                setCurrentUser({
                    uid: fbUser.uid,
                    email: fbUser.email,
                    name: userData.name || fbUser.displayName,
                    role: null, // Explicitly set role to null if missing
                });
            } else {
                setCurrentUser({
                    uid: fbUser.uid,
                    email: fbUser.email,
                    name: userData.name || fbUser.displayName,
                    role: userData.role,
                });
                console.log(`[AuthContext] User role set to: "${userData.role}" for UID: ${fbUser.uid}`);
            }
          } else {
            setCurrentUser(null); 
            console.warn(`[AuthContext] User document NOT FOUND in Firestore for UID: ${fbUser.uid}. User might need to complete profile or data is missing. CurrentUser set to null.`);
          }
          setLoading(false); 
          console.log('[AuthContext] Firestore data processed. Loading set to false.');
        }, (error) => {
          console.error("[AuthContext] Error fetching user document from Firestore:", error);
          setCurrentUser(null);
          setLoading(false);
          console.log('[AuthContext] Error during Firestore fetch. Loading set to false.');
        });
        
        return () => {
          console.log(`[AuthContext] Unsubscribing Firestore snapshot listener for UID: ${fbUser.uid}`);
          unsubscribeSnapshot();
        }

      } else {
        // User is signed out
        console.log('[AuthContext] Firebase auth state changed. No user signed in.');
        setCurrentUser(null);
        setLoading(false);
        console.log('[AuthContext] No user. Loading set to false.');
      }
    });

    return () => {
      console.log('[AuthContext] Unsubscribing Firebase auth state listener.');
      unsubscribeAuth();
    }
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  // Show a global loader while authentication and user data fetching is in progress.
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading user session...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, firebaseUser, loading, isAdmin, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
