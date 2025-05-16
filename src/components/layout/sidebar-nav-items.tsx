
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserCircle, Wand2, Settings, HelpCircle, ShieldCheck, FileText } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  roles?: Array<'student' | 'admin'>; // Role-based visibility
};

const allNavItems: NavItem[] = [
  { href: '/', label: 'Leaderboard', icon: LayoutDashboard, roles: ['student', 'admin'] },
  { href: '/profile', label: 'My Profile', icon: UserCircle, roles: ['student', 'admin'] },
  { href: '/suggest-categories', label: 'Suggest Categories', icon: Wand2, roles: ['student', 'admin'] },
  { href: '/request-points', label: 'Request Points', icon: FileText, roles: ['student'] },
  { href: '/admin/dashboard', label: 'Admin Dashboard', icon: ShieldCheck, roles: ['admin'] },
];


export function SidebarNavItems() {
  const pathname = usePathname();
  const { currentUser, isAdmin, isStudent } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const visibleNavItems = allNavItems.filter(item => {
    if (!item.roles) return true; // No role restriction
    if (isAdmin && item.roles.includes('admin')) return true;
    if (isStudent && item.roles.includes('student')) return true;
    return false;
  });

  if (!currentUser) return null;

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild={false} 
              isActive={isActive(item.href)}
              tooltip={item.label}
              className={cn(item.disabled && "cursor-not-allowed opacity-50")}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : undefined}
            >
              <item.icon aria-hidden="true" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
