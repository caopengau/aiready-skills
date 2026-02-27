'use client';

import React from 'react';
import { cn } from '../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

const DefaultSeparator = () => (
  <svg
    className="h-4 w-4 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

export function Breadcrumb({ items, separator, className }: BreadcrumbProps) {
  const Separator = separator || <DefaultSeparator />;

  return (
    <nav
      className={cn('flex items-center gap-1 text-sm', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <span className="flex-shrink-0">{Separator}</span>}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={
                    isLast ? 'font-medium text-slate-900' : 'text-slate-600'
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
