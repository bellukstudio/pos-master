import { cn } from "@/utils/cn";
import { Logo, type IconProps } from "@/utils/icon";

export const BRAND_NAME = "Pos Master";

/**
 * Icon-only mark (used when the sidebar is collapsed).
 */
export function BrandMark(props: IconProps) {
  return <Logo {...props} />;
}

/**
 * Full logo: icon mark + wordmark text.
 * Replaces the old NextAdmin SVG wordmark.
 */
export function BrandLogo({
  className,
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2")}>
      <Logo width={28} height={28} />
      <span
        className={cn(
          "text-lg leading-none font-bold tracking-tight",
          dark ? "text-text-secondary" : "text-text-primary", className
        )}
      >
        Pos<span className="text-[#9590FF]">Master</span>
      </span>
    </span>
  );
}
