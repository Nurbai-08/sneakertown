export const EmptyState = ({ title, text, action }) => (
  <div className="grid min-h-80 place-items-center rounded-md border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800">
    <div>
      <h2 className="text-2xl font-black">{title}</h2>
      {text && <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  </div>
);
