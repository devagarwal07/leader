"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, UserCircle, Wand2, Settings, HelpCircle } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  children?: NavItem[];
  separator?: boolean;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Leaderboard', icon: LayoutDashboard },
  { href: '/profile', label: 'My Profile', icon: UserCircle },
  { href: '/suggest-categories', label: 'Suggest Categories', icon: Wand2 },
];


export function SidebarNavItems() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild={false} // Ensure it's a button or anchor for styling
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
