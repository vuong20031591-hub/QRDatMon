/**
 * Header Component
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useSidebarStore } from '@/stores/sidebar-store';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from '@/features/notifications';

// Map pathname to page title
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/orders': 'Quản lý đơn hàng',
  '/tables': 'Quản lý bàn',
  '/menu': 'Quản lý thực đơn',
  '/staff': 'Quản lý nhân viên',
  '/inventory': 'Quản lý kho',
  '/reviews': 'Đánh giá',
  '/reports': 'Báo cáo',
  '/settings': 'Cài đặt',
  '/promotions': 'Khuyến mãi',
  '/bills': 'Hóa đơn',
  '/profile': 'Hồ sơ cá nhân',
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, staff, logout } = useAuth();
  const { isCollapsed } = useSidebarStore();

  // Get page title from pathname
  const getPageTitle = () => {
    // Exact match first
    if (pageTitles[pathname]) return pageTitles[pathname];
    // Check for partial match (e.g., /orders/123 -> Quản lý đơn hàng)
    const basePath = '/' + pathname.split('/')[1];
    return pageTitles[basePath] || 'Dashboard';
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        'fixed top-0 z-40 flex h-16 items-center justify-between border-b bg-white dark:bg-zinc-950 px-4 transition-all duration-300',
        isCollapsed ? 'left-16' : 'left-64',
        'right-0'
      )}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <NotificationDropdown />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                {staff && (
                  <p className="text-xs text-muted-foreground capitalize">
                    {staff.role} • {staff.employeeCode}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Hồ sơ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
