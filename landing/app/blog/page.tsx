import { getAllPosts } from '@/lib/blog-tsx';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BlogPageClient } from '@/components/BlogPageClient';
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Blog - AIReady',
  description:
    'Insights on AI-assisted development, code quality, and building AI-ready codebases. Learn about semantic duplication, context window optimization, and developer productivity.',
  openGraph: {
    title: 'AIReady Blog - Insights on AI-Ready Development',
    description:
      'Insights on AI-assisted development, code quality, and building AI-ready codebases.',
    url: 'https://getaiready.dev/blog',
    siteName: 'AIReady',
    images: [
      {
        url: 'https://getaiready.dev/logo-text.png',
        width: 2046,
        height: 800,
        alt: 'AIReady Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIReady Blog',
    description: 'Insights on AI-assisted development and code quality',
    images: ['https://getaiready.dev/logo-text.png'],
    creator: '@aireadytools',
  },
  alternates: {
    canonical: 'https://getaiready.dev/blog',
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-x-hidden">
      <Header />
      {/* Gradient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/10 via-transparent to-purple-50/10 pointer-events-none" />
      <main className="relative z-10">
        <BlogPageClient posts={posts as any} />
      </main>
      <Footer />
    </div>
  );
}
