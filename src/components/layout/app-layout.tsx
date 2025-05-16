
"use client";

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { SidebarNavItems } from './sidebar-nav-items';
import { AppLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn, UserPlus } from 'lucide-react';
// import { Toaster } from "@/components/ui/toaster"; // Moved to RootLayout
import { useAuth } from '@/contexts/auth-context';
import { logoutAction } from '@/lib/auth-actions';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" side="left" className={!currentUser ? "hidden" : ""}>
        <SidebarRail />
        <SidebarHeader className="items-center gap-3 p-4">
          <AppLogo />
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            Meritocracy Board
          </span>
        </SidebarHeader>
        <SidebarContent className="p-0">
          {currentUser && <SidebarNavItems />}
        </SidebarContent>
        <SidebarFooter className="p-4">
          {currentUser && (
            <Button variant="ghost" onClick={handleLogout} className="justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
              <LogOut />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 lg:h-[60px]">
          <div className="md:hidden">
            {currentUser && <SidebarTrigger />}
          </div>
          <h1 className="text-lg font-semibold md:text-xl">Meritocracy Board</h1>
          <div>
            {loading ? null : currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                       <AvatarImage src={currentUser.role === 'student' ? `https://placehold.co/100x100.png/29ABE2/FFFFFF?text=${currentUser.name?.substring(0,1)}` : `https://placehold.co/100x100.png/9C27B0/FFFFFF?text=${currentUser.name?.substring(0,1)}`} alt={currentUser.name || 'User'} data-ai-hint="person user" />
                      <AvatarFallback>{currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account ({currentUser.role})</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                  {currentUser.role === 'admin' && <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>Admin Dashboard</DropdownMenuItem>}
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/login')}>
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
                <Button onClick={() => router.push('/signup')}>
                  <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                </Button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      {/* <Toaster />  Moved to RootLayout */}
    </SidebarProvider>
  );
}
