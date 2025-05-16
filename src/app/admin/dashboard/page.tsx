
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
  const [isLoadingTable, setIsLoadingTable] = useState(true);
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
    if (authLoading) {
      console.log("[AdminDashboardPage Effect] Auth loading, returning.");
      return;
    }

    if (!currentUser) {
      console.log("[AdminDashboardPage Effect] No current user, redirecting to login.");
      router.push('/login?redirect=/admin/dashboard');
      return;
    }

    if (!isAdmin) {
      console.log(`[AdminDashboardPage Effect] User is not admin (role: ${currentUser.role}), redirecting to home might be better or showing access denied.`);
      // The rendering logic below will handle showing Access Denied if isAdmin is false.
      // No need to redirect from here if we show a proper message.
      // router.push('/');
      return;
    }

    // User is admin, fetch requests
    if (isAdmin) {
      console.log("[AdminDashboardPage Effect] User is admin, fetching requests.");
      fetchRequests(activeTab === 'all' ? undefined : activeTab);
    }
  }, [currentUser, authLoading, isAdmin, router, fetchRequests, activeTab]);


  const handleTabChange = (value: string) => {
    const tabValue = value as 'pending' | 'approved' | 'rejected' | 'all';
    setActiveTab(tabValue);
  };

  const handleActionComplete = () => {
    if (isAdmin) {
        fetchRequests(activeTab === 'all' ? undefined : activeTab);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying admin access...</p>
      </div>
    );
  }

  if (!currentUser) {
     return (
        <div className="container mx-auto py-8 flex justify-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-6 w-6"/> Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You must be logged in to view this page.</p>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Please log in. If you continue to see this, check console logs from AuthContext.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!isAdmin) { // Direct check on isAdmin after authLoading
     return (
        <div className="container mx-auto py-8 flex justify-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-6 w-6"/> Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You do not have permission to view this page. Your role is: '{currentUser.role || "Not defined"}'.</p>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Ensure your user account in Firestore has the 'role' field correctly set to 'admin'.
                      Check the browser's developer console for detailed authentication logs from AuthContext.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  // Render Admin Dashboard Content (user is authenticated AND isAdmin is true)
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
          <CardDescription>
            Manage student point requests. {currentUser?.name ? `Welcome, ${currentUser.name}!` : ''}
          </CardDescription>
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
