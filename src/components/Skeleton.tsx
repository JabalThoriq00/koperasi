import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-32 h-6 mb-2" />
        </div>
        <Skeleton variant="rounded" className="w-12 h-12" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="w-full h-4" />
        </td>
      ))}
    </tr>
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="w-3/4 h-4 mb-2" />
          <Skeleton className="w-1/2 h-3 mb-2" />
          <Skeleton className="w-1/4 h-4" />
        </div>
      </div>
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="w-48 h-8 mb-2" />
        <Skeleton className="w-64 h-4" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md animate-pulse">
        <Skeleton className="w-40 h-6 mb-4" />
        <Skeleton variant="rounded" className="w-full h-48" />
      </div>
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="animate-pulse">
      <Skeleton variant="rounded" className="w-full" style={{ height }} />
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md animate-pulse">
      <div className="flex flex-col items-center mb-6">
        <Skeleton variant="circular" className="w-24 h-24 mb-4" />
        <Skeleton className="w-32 h-6 mb-2" />
        <Skeleton className="w-20 h-4" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <Skeleton className="w-16 h-3 mb-1" />
            <Skeleton className="w-full h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}

