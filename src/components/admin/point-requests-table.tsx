
"use client";

import type { PointRequest } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Loader2, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { approvePointRequestAction, rejectPointRequestAction } from '@/lib/auth-actions';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Corrected imports

interface PointRequestsTableProps {
  requests: PointRequest[];
  onActionComplete: () => void; // Callback to refresh data
}

const approvalSchema = z.object({
  pointsAwarded: z.coerce.number().min(1, "Points must be at least 1."),
  adminNotes: z.string().optional(),
});
type ApprovalFormData = z.infer<typeof approvalSchema>;

const rejectionSchema = z.object({
  adminNotes: z.string().min(5, "Please provide a reason for rejection.").optional(),
});
type RejectionFormData = z.infer<typeof rejectionSchema>;


export function PointRequestsTable({ requests, onActionComplete }: PointRequestsTableProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PointRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const approvalForm = useForm<ApprovalFormData>({ resolver: zodResolver(approvalSchema) });
  const rejectionForm = useForm<RejectionFormData>({ resolver: zodResolver(rejectionSchema) });

  const handleApproveClick = (request: PointRequest) => {
    setSelectedRequest(request);
    approvalForm.reset({ pointsAwarded: request.pointsAwarded || 10, adminNotes: request.adminNotes || "" });
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = (request: PointRequest) => {
    setSelectedRequest(request);
    rejectionForm.reset({ adminNotes: request.adminNotes || "" });
    setIsRejectDialogOpen(true);
  };

  const onApproveSubmit = async (data: ApprovalFormData) => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    const result = await approvePointRequestAction({
      requestId: selectedRequest.id,
      pointsAwarded: data.pointsAwarded,
      adminNotes: data.adminNotes,
    });
    setIsSubmitting(false);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Request approved." });
      setIsApproveDialogOpen(false);
      onActionComplete();
    }
  };
  
  const onRejectSubmit = async (data: RejectionFormData) => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    const result = await rejectPointRequestAction({
      requestId: selectedRequest.id,
      adminNotes: data.adminNotes,
    });
    setIsSubmitting(false);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Request rejected." });
      setIsRejectDialogOpen(false);
      onActionComplete();
    }
  };

  const getStatusBadge = (status: PointRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-500"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (requests.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No point requests found for this filter.</p>;
  }

  return (
    <>
      <div className="rounded-lg border shadow-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Requested At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.studentName}</TableCell>
                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                <TableCell>{request.requestedAt ? format(parseISO(request.requestedAt as string), 'PPpp') : 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">{request.pointsAwarded ?? (request.status === 'pending' ? '-' : (request.status === 'rejected' ? '0' : 'N/A'))}</TableCell>
                <TableCell className="text-center">
                  {request.status === 'pending' && (
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-500 hover:bg-green-50 hover:text-green-700" onClick={() => handleApproveClick(request)}>
                        <CheckCircle className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => handleRejectClick(request)}>
                        <XCircle className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                   {(request.status === 'approved' || request.status === 'rejected') && request.adminNotes && (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground">
                                    <MessageSquare className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p className="text-sm"><strong>Admin Notes:</strong> {request.adminNotes}</p>
                                {request.reviewedAt && <p className="text-xs text-muted-foreground">Reviewed: {format(parseISO(request.reviewedAt as string), 'PPpp')}</p>}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                   )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Point Request</DialogTitle>
            <DialogDescription>Review the request and award points.</DialogDescription>
          </DialogHeader>
          <form onSubmit={approvalForm.handleSubmit(onApproveSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="pointsAwarded">Points to Award</Label>
              <Input id="pointsAwarded" type="number" {...approvalForm.register("pointsAwarded")} />
              {approvalForm.formState.errors.pointsAwarded && <p className="text-sm text-destructive mt-1">{approvalForm.formState.errors.pointsAwarded.message}</p>}
            </div>
            <div>
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea id="adminNotes" placeholder="e.g., Great initiative!" {...approvalForm.register("adminNotes")} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Approve
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Point Request</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this request.</DialogDescription>
          </DialogHeader>
           <form onSubmit={rejectionForm.handleSubmit(onRejectSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="rejectAdminNotes">Admin Notes / Reason for Rejection</Label>
              <Textarea id="rejectAdminNotes" placeholder="e.g., Not enough detail provided." {...rejectionForm.register("adminNotes")} />
               {rejectionForm.formState.errors.adminNotes && <p className="text-sm text-destructive mt-1">{rejectionForm.formState.errors.adminNotes.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reject Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
