import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: "AIReady Platform - Make Your Codebase AI-Ready",
    template: "%s | AIReady Platform"
  },
  description: "Free tools to optimize your codebase for AI collaboration. Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}