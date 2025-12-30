import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, max = 100, className, indicatorClassName }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-gray-800', className)}>
      <div
        className={cn('h-full rounded-full bg-blue-500 transition-all duration-500', indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
