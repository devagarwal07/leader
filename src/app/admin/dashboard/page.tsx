
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
      return; 
    }

    if (!currentUser) {
      router.push('/login?redirect=/admin/dashboard');
      return;
    }

    if (currentUser && !isAdmin) {
      // Not an admin, redirect to home. The component will render "Access Denied" before redirect.
      // The access denied card below also handles this visually if redirection is slow.
      router.push('/'); 
      return;
    }

    if (isAdmin) {
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

  // After authLoading is false, if user is not an admin (or not logged in at all)
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
                    <p className="text-xs mt-2 text-muted-foreground">
                      If you believe you are an admin, please ensure your user account in the database has the 'role' field correctly set to 'admin'.
                      Check the browser's developer console for more detailed authentication logs from AuthContext.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  // Render Admin Dashboard Content (if user is authenticated and is an admin)
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
