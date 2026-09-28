import { cn } from "@/utils/cn";
import { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  action,
  className,
}: Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between lg:px-6",
        className,
      )}
    >
      <div>
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">{title}</h1>
        {description ? (
          <p className="text-sm leading-5 text-text-tertiary">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
