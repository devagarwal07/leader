
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userDocRef = doc(db, "users", fbUser.uid);
        
        // Listen for real-time updates to user document
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
            // User doc doesn't exist, might be initial signup phase or error
            setCurrentUser(null); 
            console.log("No such user document!");
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user document:", error);
          setCurrentUser(null);
          setLoading(false);
        });
        
        return () => unsubscribeSnapshot(); // Cleanup snapshot listener on auth state change

      } else {
        // User is signed out
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener on component unmount
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
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
