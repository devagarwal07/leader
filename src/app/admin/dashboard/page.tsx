
"use client"; // This page involves client-side data fetching and state

import { useEffect, useState, useCallback } from 'react';
import { PointRequestsTable } from '@/components/admin/point-requests-table';
import type { PointRequest } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { getPointRequestsAction } from '@/lib/auth-actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboardPage() {
  const { currentUser, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<PointRequest[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(true); // Renamed to avoid conflict
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>("pending");

  const fetchRequests = useCallback(async (status?: 'pending' | 'approved' | 'rejected') => {
    setIsLoadingTable(true);
    setError(null);
    try {
      const tabStatus = status === 'all' ? undefined : status;
      const result = await getPointRequestsAction(tabStatus);
      if (result.error) {
        setError(result.error);
        setRequests([]);
      } else {
        setRequests(result.requests || []);
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch requests.");
      setRequests([]);
    }
    setIsLoadingTable(false);
  }, []);

  useEffect(() => {
    // This effect handles redirection based on auth state.
    // It only runs after authLoading is false.
    if (authLoading) {
      return; // Wait until auth state is resolved by AuthContext
    }

    if (!currentUser) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }

    if (currentUser && !isAdmin) {
      router.push('/'); // Redirect non-admins to home page
      return;
    }

    // If execution reaches here, user is an admin. Fetch initial data.
    // This check for isAdmin is somewhat redundant due to the component structure below,
    // but harmless.
    if (isAdmin) {
        fetchRequests(activeTab === 'all' ? undefined : activeTab);
    }
  }, [currentUser, authLoading, isAdmin, router, fetchRequests, activeTab]);


  const handleTabChange = (value: string) => {
    const tabValue = value as 'pending' | 'approved' | 'rejected' | 'all';
    setActiveTab(tabValue);
    // fetchRequests is called within the main useEffect when activeTab changes and user is admin
  };
  
  const handleActionComplete = () => {
    // Re-fetch requests for the current tab after an action.
    // Ensure isAdmin is true before fetching, though page structure should guarantee this.
    if (isAdmin) {
        fetchRequests(activeTab === 'all' ? undefined : activeTab);
    }
  };

  // 1. Handle Auth Loading State (covered by AuthContext's global loader, but good for clarity)
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading authentication...</p>
      </div>
    );
  }

  // 2. Handle Access Denied State (after auth is resolved)
  // If auth is resolved, and user is not an admin (or not logged in), show access denied.
  // The useEffect above should have redirected, but this is a safeguard for the rendered content.
  if (!currentUser || !isAdmin) {
     return (
        <div className="container mx-auto py-8 flex justify-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-6 w-6"/> Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You do not have permission to view this page. Please ensure you are logged in with an administrator account.</p>
                    <p className="text-xs mt-2 text-muted-foreground">If you are an admin, please check your user role in the database.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  // 3. Render Admin Dashboard Content (if user is authenticated and is an admin)
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
          <CardDescription>Manage student point requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            {isLoadingTable ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center py-4">
                    <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
                    <p className="text-destructive">Error fetching requests: {error}</p>
                </div>
            ) : (
                // Ensure TabsContent always has a valid value from activeTab
                // The dummy TabsContent are for when data for other tabs might not be loaded yet.
                // We only need to render the content for the activeTab.
                <>
                  <TabsContent value="pending" className={activeTab === 'pending' ? 'mt-0' : 'hidden'}>
                     <PointRequestsTable requests={requests} onActionComplete={handleActionComplete} />
                  </TabsContent>
                  <TabsContent value="approved" className={activeTab === 'approved' ? 'mt-0' : 'hidden'}>
                     <PointRequestsTable requests={requests} onActionComplete={handleActionComplete} />
                  </TabsContent>
                  <TabsContent value="rejected" className={activeTab === 'rejected' ? 'mt-0' : 'hidden'}>
                     <PointRequestsTable requests={requests} onActionComplete={handleActionComplete} />
                  </TabsContent>
                  <TabsContent value="all" className={activeTab === 'all' ? 'mt-0' : 'hidden'}>
                     <PointRequestsTable requests={requests} onActionComplete={handleActionComplete} />
                  </TabsContent>
                </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
