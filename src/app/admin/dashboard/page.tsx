
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>("pending");


  const fetchRequests = useCallback(async (status?: 'pending' | 'approved' | 'rejected') => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass undefined for 'all' tab to fetch all requests
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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login?redirect=/admin/dashboard');
    } else if (!authLoading && currentUser && !isAdmin) {
      router.push('/'); // Redirect non-admins
    } else if (isAdmin) {
      fetchRequests(activeTab === 'all' ? undefined : activeTab);
    }
  }, [currentUser, authLoading, isAdmin, router, fetchRequests, activeTab]);

  const handleTabChange = (value: string) => {
    const tabValue = value as 'pending' | 'approved' | 'rejected' | 'all';
    setActiveTab(tabValue);
    fetchRequests(tabValue === 'all' ? undefined : tabValue);
  };
  
  const handleActionComplete = () => {
    fetchRequests(activeTab === 'all' ? undefined : activeTab); // Refresh current tab
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
     return (
        <div className="container mx-auto py-8 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this page.</p>
                </CardContent>
            </Card>
        </div>
    );
  }


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
            
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <p className="text-destructive text-center py-4">Error fetching requests: {error}</p>
            ) : (
                <TabsContent value={activeTab} className="mt-0">
                     <PointRequestsTable requests={requests} onActionComplete={handleActionComplete} />
                </TabsContent>
            )}
            {/* Render dummy TabsContent for other tabs to prevent missing content errors initially */}
            {activeTab !== "pending" && <TabsContent value="pending" className="hidden" />}
            {activeTab !== "approved" && <TabsContent value="approved" className="hidden" />}
            {activeTab !== "rejected" && <TabsContent value="rejected" className="hidden" />}
            {activeTab !== "all" && <TabsContent value="all" className="hidden" />}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
