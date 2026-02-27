'use client';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-slate-300 border-t-blue-600`}
      />
    </div>
  );
}

export interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = 'Loading...',
}: LoadingOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-slate-500 animate-pulse">{message}</p>
    </div>
  );
}
