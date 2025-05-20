import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

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
    <html lang="en" className="dark"> {/* Added dark class */}
      <body className={`${geistSans.variable} ${geistMono.variable} font-mono antialiased`}> {/* Applied font-mono */}
        {children}
        <Toaster /> {/* Added Toaster */}
      </body>
    </html>
  );
}
