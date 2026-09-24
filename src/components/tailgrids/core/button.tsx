"use client";

import { cn } from "@/utils/cn";
import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
  composeRenderProps,
} from "react-aria-components";

import { buttonStyles } from "./button-styles";

export { buttonStyles };

export type ButtonProps = RACButtonProps & {
  variant?: "primary" | "danger" | "success" | "ghost";
  appearance?: "fill" | "outline" | "ghost";
  iconOnly?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  focused?: boolean;
};

export function Button({
  variant,
  appearance,
  iconOnly,
  size,
  focused,
  children,
  className,
  ...props
}: ButtonProps) {
  let normalizedVariant = variant;
  let normalizedAppearance = appearance;

  if (variant === "ghost") {
    normalizedVariant = "primary";
    normalizedAppearance = "ghost";
  }

  return (
    <RACButton
      data-focused={focused ? "true" : undefined}
      className={composeRenderProps(className, (className) =>
        cn(
          buttonStyles({
            variant: normalizedVariant,
            appearance: normalizedAppearance,
            iconOnly,
            size,
          }),
          className,
        ),
      )}
      {...props}
    >
      {children}
    </RACButton>
  );
}