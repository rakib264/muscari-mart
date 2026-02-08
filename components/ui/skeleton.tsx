import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Consistent skeleton color that matches the theme
        'animate-pulse rounded-md bg-muted',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
