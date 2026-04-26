/**
 * Button — Matters Design System 1.5
 *
 * Sister implementation of `components/buttons/normal/` (vendored copy).
 * Spec: `components/buttons/normal/spec.md`.
 * Visual fidelity must match the vendored impl. If you change one, change both.
 */
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "large" | "medium" | "small";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant. Defaults to `"primary"`. */
  variant?: ButtonVariant;
  /** Size. Defaults to `"medium"`. Touch-target ≥ 44px is met at `large`; `small` is desktop-only. */
  size?: ButtonSize;
  /**
   * If true, the button has a 1:1 aspect ratio and `aria-label` becomes
   * mandatory. Use for nav rails, toolbars, kebab menus.
   */
  iconOnly?: boolean;
  /** Stretches the button to its container width. */
  fullWidth?: boolean;
  /**
   * If true, replaces the left icon with a spinner and sets `aria-busy="true"`.
   * The label remains visible (and announced) so screen readers don't lose context.
   * The button is also marked `aria-disabled`; click handlers will not fire.
   */
  loading?: boolean;
  /** Optional left-side icon. Pass an `<svg>` or any element; sized to 1em. */
  leftIcon?: ReactNode;
  /** Optional right-side icon. */
  rightIcon?: ReactNode;
}

/**
 * Returns the className string a Button would receive, without rendering one.
 *
 * Use this to apply Button styling to non-button elements (e.g. `<a>` for routing,
 * `<label>` for file inputs). When you do this YOU are responsible for keyboard,
 * focus and a11y semantics — prefer `<Button>` whenever the element is actually
 * a button.
 *
 * @example
 *   <Link href="/login" className={getButtonClassName({ variant: "primary" })}>
 *     登入
 *   </Link>
 */
export function getButtonClassName(
  opts: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    iconOnly?: boolean;
    fullWidth?: boolean;
    className?: string;
  } = {}
): string {
  const { variant = "primary", size = "medium", iconOnly, fullWidth, className } = opts;
  return clsx(
    styles.button,
    styles[variant],
    styles[size],
    iconOnly && styles.iconOnly,
    fullWidth && styles.fullWidth,
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "medium",
    iconOnly = false,
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    type = "button",
    className,
    children,
    onClick,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  if (process.env.NODE_ENV !== "production") {
    if (iconOnly && !ariaLabel) {
      // eslint-disable-next-line no-console
      console.warn(
        "[@matters/design-system-react] <Button iconOnly> requires an `aria-label` for screen readers."
      );
    }
  }

  // Loading effectively disables interaction but keeps focus/visibility.
  const isInteractionBlocked = loading || disabled;

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (isInteractionBlocked) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const renderedLeft = loading ? (
    <span className={styles.spinner} aria-hidden="true" />
  ) : leftIcon ? (
    <span className={styles.icon} aria-hidden="true">
      {leftIcon}
    </span>
  ) : null;

  const renderedRight =
    !loading && rightIcon ? (
      <span className={styles.icon} aria-hidden="true">
        {rightIcon}
      </span>
    ) : null;

  return (
    <button
      ref={ref}
      type={type}
      className={getButtonClassName({ variant, size, iconOnly, fullWidth, className })}
      disabled={disabled}
      aria-disabled={loading || disabled || undefined}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={handleClick}
      {...rest}
    >
      {renderedLeft}
      {iconOnly ? null : <span>{children}</span>}
      {renderedRight}
    </button>
  );
});

Button.displayName = "Button";
