/**
 * Sidebar Component
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  TableProperties,
  ClipboardList,
  Users,
  Receipt,
  Tag,
  Package,
  Star,
  BarChart3,
  Settings,
  ChevronLeft,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/stores/sidebar-store';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/types';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'waiter', 'cashier', 'kitchen'] },
  { title: 'Thực đơn', href: '/menu', icon: UtensilsCrossed, roles: ['admin', 'manager'] },
  { title: 'Bàn', href: '/tables', icon: TableProperties, roles: ['admin', 'manager', 'waiter'] },
  { title: 'Đơn hàng', href: '/orders', icon: ClipboardList, roles: ['admin', 'manager', 'waiter', 'cashier'] },
  { title: 'Nhân viên', href: '/staff', icon: Users, roles: ['admin', 'manager'] },
  { title: 'Hóa đơn', href: '/bills', icon: Receipt, roles: ['admin', 'manager', 'cashier'] },
  { title: 'Khuyến mãi', href: '/promotions', icon: Tag, roles: ['admin', 'manager'] },
  { title: 'Kho', href: '/inventory', icon: Package, roles: ['admin', 'manager'] },
  { title: 'Đánh giá', href: '/reviews', icon: Star, roles: ['admin', 'manager'] },
  { title: 'Báo cáo', href: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { title: 'Cài đặt', href: '/settings', icon: Settings, roles: ['admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const { hasAnyRole } = useAuth();

  const filteredItems = navItems.filter(item => hasAnyRole(item.roles));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/" className={cn("flex items-center gap-2", isCollapsed && "hidden")}>
          <img src="/logo.jpg" alt="QRDatMon" className="h-8 w-8 rounded-md object-cover" />
          <span className="text-xl font-bold text-primary">QRDatMon</span>
        </Link>
        {isCollapsed && (
          <Link href="/" className="mx-auto">
            <img src="/logo.jpg" alt="QRDatMon" className="h-8 w-8 rounded-md object-cover" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn(isCollapsed && "absolute right-1 top-4")}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center px-2'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
