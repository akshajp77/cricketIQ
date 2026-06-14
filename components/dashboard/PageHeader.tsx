import { cn } from "@/lib/utils";

interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {kicker && (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            {kicker}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <div className="mt-1 text-sm text-ink-secondary">{description}</div>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
