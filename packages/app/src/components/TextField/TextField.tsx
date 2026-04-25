/**
 * TextField — Matters Design System 1.5
 *
 * Source spec: components/inputs/text-field/spec.md
 * Figma node:  3307:19338 in Design System 1.5 (JDKpHezhllOvJF42xbKcNN)
 *
 * Figma palette remap (PM 2026-04-24): Logo/Matters Green → --color-brand-new-purple.
 *
 * Phase 2 covers: label, helper text, error, leftIcon/rightIcon, label-side
 * link, multiline (as <textarea>), full a11y. Sizing: medium only (Phase 4
 * will revisit if smaller / inline variants are needed).
 */
import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, Ref } from "react";
import clsx from "clsx";
import styles from "./TextField.module.css";

interface CommonProps {
  /** Visible label text. Pass a string; for complex labels render your own `<label>` and pass `aria-label` instead. */
  label?: ReactNode;
  /** Visually hide the label while keeping it accessible. */
  labelHidden?: boolean;
  /** Marks the field as required and shows a `*`. Does NOT set the native `required` attribute alone — pass `required` for that. */
  showRequired?: boolean;
  /** Optional link/button rendered on the right of the label row (e.g. "忘記密碼？"). */
  labelAction?: { label: string; onClick?: () => void; href?: string };
  /** Helper text shown below the field. Replaced by `error` when present. */
  helperText?: ReactNode;
  /** Error message. When truthy, the field paints red and `aria-invalid` is set. */
  error?: ReactNode;
  /** Optional left-side icon. */
  leftIcon?: ReactNode;
  /** Optional right-side icon. */
  rightIcon?: ReactNode;
  /** Wrapper className (root element). */
  className?: string;
}

export interface TextFieldProps
  extends CommonProps, Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Render `<input>`. Default. */
  multiline?: false;
}

export interface TextAreaFieldProps
  extends CommonProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** Render `<textarea>` instead. */
  multiline: true;
}

type AnyTextFieldProps = TextFieldProps | TextAreaFieldProps;

function TextFieldInner(
  props: AnyTextFieldProps,
  ref: Ref<HTMLInputElement | HTMLTextAreaElement>
) {
  const {
    label,
    labelHidden,
    showRequired,
    labelAction,
    helperText,
    error,
    leftIcon,
    rightIcon,
    className,
    id: idProp,
    disabled,
    multiline,
    "aria-describedby": ariaDescribedByProp,
    ...rest
  } = props as AnyTextFieldProps & { multiline?: boolean };

  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  const describedBy =
    [error ? errorId : null, !error && helperText ? helperId : null, ariaDescribedByProp || null]
      .filter(Boolean)
      .join(" ") || undefined;

  const fieldClassName = clsx(styles.field, error && styles.error, disabled && styles.disabled);

  return (
    <div className={clsx(styles.root, className)}>
      {(label || labelAction) && (
        <div className={styles.labelRow}>
          {label && (
            <label htmlFor={id} className={clsx(styles.label, labelHidden && styles.srOnly)}>
              {label}
              {showRequired && (
                <span className={styles.required} aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {labelAction &&
            (labelAction.href ? (
              <a className={styles.labelLink} href={labelAction.href}>
                {labelAction.label}
              </a>
            ) : (
              <button type="button" className={styles.labelLink} onClick={labelAction.onClick}>
                {labelAction.label}
              </button>
            ))}
        </div>
      )}

      <div className={fieldClassName}>
        {leftIcon && (
          <span className={styles.icon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {multiline ? (
          <textarea
            id={id}
            ref={ref as Ref<HTMLTextAreaElement>}
            className={clsx(styles.input, styles.multiline)}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={id}
            ref={ref as Ref<HTMLInputElement>}
            className={styles.input}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {rightIcon && (
          <span className={styles.icon} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p id={errorId} className={clsx(styles.helper, styles.errorText)} role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className={styles.helper}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export const TextField = forwardRef(TextFieldInner) as ((
  props: TextFieldProps & { ref?: Ref<HTMLInputElement> }
) => ReturnType<typeof TextFieldInner>) &
  ((
    props: TextAreaFieldProps & { ref?: Ref<HTMLTextAreaElement> }
  ) => ReturnType<typeof TextFieldInner>) & {
    displayName: string;
  };

(TextField as { displayName: string }).displayName = "TextField";
