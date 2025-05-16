
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { AuthProvider } from '@/contexts/auth-context'; // Added AuthProvider
import { Toaster } from "@/components/ui/toaster"; // Moved Toaster here for global access

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meritocracy Board',
  description: 'Track and showcase student achievements and points.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider> {/* Wrapped with AuthProvider */}
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster /> {/* Global Toaster */}
        </AuthProvider>
      </body>
    </html>
  );
}
