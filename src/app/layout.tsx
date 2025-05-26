import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { NavigationHeader } from '@/components/navigation-header'; // Added NavigationHeader

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Code Companion',
  description: 'Your AI partner for Java development',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-mono antialiased`}>
        <NavigationHeader /> {/* Added NavigationHeader */}
        <main className="pt-16"> {/* Add padding-top to avoid overlap with fixed header */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
