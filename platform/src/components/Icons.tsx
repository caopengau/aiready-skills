import React from 'react';

export function RocketIcon({ className = 'w-6 h-6', ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} {...props} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2c1.5 0 3 1 3 1s1.2 1.8 1.2 4.2c0 2.4-1.2 5-3.6 7.4-2.4 2.4-5 3.6-7.4 3.6C3.8 18.2 2 17 2 17S3 15.5 3 14c0-2.1 1.5-3.6 1.5-3.6S7.5 9 9 9c2.4 0 3-7 3-7z" strokeWidth="0" fill="currentColor" />
      <path d="M14 10c.8.8 2 2 3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChartIcon({ className = 'w-6 h-6', ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} {...props} xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.2" />
      <rect x="7" y="11" width="2" height="6" fill="currentColor" />
      <rect x="11" y="8" width="2" height="9" fill="currentColor" />
      <rect x="15" y="5" width="2" height="12" fill="currentColor" />
    </svg>
  );
}

export function TargetIcon({ className = 'w-6 h-6', ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} {...props} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <path d="M22 12h-3M5 12H2M12 2v3M12 19v3" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function RobotIcon({ className = 'w-6 h-6', ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} {...props} xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="18" height="11" rx="2" strokeWidth="1.2" />
      <rect x="7" y="10" width="2" height="2" fill="currentColor" />
      <rect x="15" y="10" width="2" height="2" fill="currentColor" />
      <path d="M9 3v2M15 3v2" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default {
  RocketIcon,
  ChartIcon,
  TargetIcon,
  RobotIcon,
};
