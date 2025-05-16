
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
    const unsubscribeAuth = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDocRef = doc(db, "users", fbUser.uid);
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            setCurrentUser({
              uid: fbUser.uid,
              email: fbUser.email,
              name: userData.name || fbUser.displayName,
              role: userData.role,
            });
          } else {
            setCurrentUser(null); 
            console.warn(`User document not found for UID: ${fbUser.uid}. User may need to complete profile or data is missing.`);
            // Potentially sign out the user if their Firestore record is essential for app function
            // import { signOut } from 'firebase/auth';
            // signOut(auth);
          }
          setLoading(false); // Firestore data processed (or determined missing)
        }, (error) => {
          console.error("Error fetching user document:", error);
          setCurrentUser(null);
          setLoading(false); // Error in Firestore fetch
        });
        
        return () => unsubscribeSnapshot();

      } else {
        // User is signed out
        setCurrentUser(null);
        setLoading(false); // Auth state resolved, no user
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  // Show a global loader while authentication and user data fetching is in progress.
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
