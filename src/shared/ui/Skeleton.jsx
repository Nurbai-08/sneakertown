export const ProductSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
    <div className="aspect-square bg-neutral-100 dark:bg-neutral-800" />
    <div className="space-y-3 p-4">
      <div className="h-3 w-20 rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-4 w-4/5 rounded bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-9 rounded bg-neutral-100 dark:bg-neutral-800" />
    </div>
  </div>
);
