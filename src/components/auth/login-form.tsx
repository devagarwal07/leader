
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loginAction } from '@/lib/auth-actions';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams(); // For reading redirect query param

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const result = await loginAction(data);
      if (result.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.success && result.userId && result.role) { // Check for role
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        const redirectUrl = searchParams.get('redirect');
        
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (result.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (result.role === 'student') {
          router.push('/profile'); // Updated: Redirect students to their profile page
        } else {
          router.push('/'); // Default for any other roles
        }
      } else {
         // Fallback for unexpected result structure, though should be covered by types
         toast({
          title: "Login Incomplete",
          description: "Could not process login fully. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during login. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Login
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
