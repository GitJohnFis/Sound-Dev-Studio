
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CodeCompanionLogo } from '@/components/code-companion-logo';
import { Button } from '@/components/ui/button';
import { HomeIcon, FlaskConicalIcon, FileCode2 } from 'lucide-react'; // Added FileCode2
import { cn } from '@/lib/utils';

export function NavigationHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Companion', icon: FileCode2 }, // Changed icon
    { href: '/playground', label: 'Playground', icon: FlaskConicalIcon },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-md">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <CodeCompanionLogo />
        <nav className="flex items-center space-x-2 sm:space-x-4">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium h-9 px-3",
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
              )}
            >
              <Link href={item.href}>
                <item.icon className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
