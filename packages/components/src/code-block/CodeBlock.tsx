'use client';

import React, { useState, useCallback, useMemo } from 'react';

export interface CodeBlockProps {
  children: React.ReactNode;
  language?: string;
  showCopy?: boolean;
  showHeader?: boolean;
  className?: string;
}

// Dedent helper - removes common leading indentation
function dedentCode(code: string): string {
  // Normalize tabs to two spaces
  let normalized = code.replace(/\t/g, '  ').replace(/[ \t]+$/gm, '');
  
  const lines = normalized.split('\n');
  if (lines.length <= 1) return normalized.trim();

  // Remove leading/trailing empty lines
  let start = 0;
  while (start < lines.length && lines[start].trim() === '') start++;
  let end = lines.length - 1;
  while (end >= 0 && lines[end].trim() === '') end--;
  
  if (start > end) return '';
  const relevantLines = lines.slice(start, end + 1);

  // Find minimum indent across non-empty lines
  const nonEmpty = relevantLines.filter((l) => l.trim() !== '');
  const minIndent = nonEmpty.reduce((min, line) => {
    const m = line.match(/^\s*/)?.[0].length ?? 0;
    return Math.min(min, m);
  }, Infinity);

  // Remove common indentation
  const dedented = minIndent === Infinity || minIndent === 0
    ? relevantLines.join('\n')
    : relevantLines.map((l) => (l.startsWith(' '.repeat(minIndent)) ? l.slice(minIndent) : l)).join('\n');
  
  return dedented;
}

// Simple Copy Button
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="rounded-md p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      )}
    </button>
  );
}

export function CodeBlock({
  children,
  language = 'typescript',
  showCopy = true,
  showHeader = true,
  className = '',
}: CodeBlockProps) {
  // Get code string from children
  const codeString = useMemo(() => {
    if (typeof children === 'string') {
      return dedentCode(children);
    }
    // Handle template literal children
    try {
      const raw = React.Children.toArray(children)
        .map((c) => (typeof c === 'string' ? c : typeof c === 'number' ? String(c) : ''))
        .join('');
      return dedentCode(raw);
    } catch {
      return '';
    }
  }, [children]);

  return (
    <div className={`group relative my-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-lg ${className}`}>
      {/* Header bar */}
      {showHeader && (
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/50" />
              <div className="h-3 w-3 rounded-full bg-amber-500/50" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
            </div>
            <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              {language}
            </span>
          </div>
          {showCopy && <CopyButton code={codeString} />}
        </div>
      )}

      {/* Code body */}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono block whitespace-pre text-slate-300">
          {codeString}
        </code>
      </pre>
    </div>
  );
}

// Inline code component
export function InlineCode({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <code className={`rounded-md bg-slate-100 px-1.5 py-0.5 text-sm font-mono text-slate-800 ${className}`}>
      {children}
    </code>
  );
}