
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { requestPointsAction } from '@/lib/auth-actions';
import { useAuth } from '@/contexts/auth-context';

const formSchema = z.object({
  reason: z.string().min(10, {
    message: "Reason must be at least 10 characters long.",
  }).max(500, {
    message: "Reason must not exceed 500 characters."
  }),
});

type FormData = z.infer<typeof formSchema>;

export function RequestPointsForm() {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!currentUser || !currentUser.uid || !currentUser.name) {
        toast({ title: "Error", description: "You must be logged in to submit a request.", variant: "destructive" });
        return;
    }
    try {
      const result = await requestPointsAction({ 
        reason: data.reason, 
        userId: currentUser.uid,
        studentName: currentUser.name 
      });

      if (result.error) {
        toast({
          title: "Request Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Request Submitted!",
          description: "Your point request has been sent for review.",
        });
        form.reset();
      }
    } catch (error) {
      console.error("Request points error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Request Points</CardTitle>
        <CardDescription>
          Describe your achievement or reason for requesting additional points. Admins will review your request.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="reason">Reason for Request</FormLabel>
                  <FormControl>
                    <Textarea
                      id="reason"
                      placeholder="e.g., 'Organized a successful charity bake sale for the school an Fd raised $200...'"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || !currentUser} className="w-full">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Request
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
