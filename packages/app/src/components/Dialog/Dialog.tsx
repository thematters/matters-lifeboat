/**
 * Dialog — Matters Design System 1.5
 *
 * Source spec:  components/feedback/dialog/spec.md
 * Figma node:   3404:1953 (Design System 1.5, JDKpHezhllOvJF42xbKcNN)
 *
 * Figma palette remap (PM 2026-04-24): Logo/Matters Green → --color-brand-new-purple.
 *
 * Phase 2 model:
 *   - Composition: <Dialog open onClose={…}><Dialog.Title/><Dialog.Body/><Dialog.Actions/></Dialog>
 *   - Accessibility: role="dialog" + aria-modal, focus trap, Escape close, scroll lock.
 *   - No external dependencies (no Radix). Bundle stays small.
 *
 * Trade-off vs @radix-ui/react-dialog: ours is smaller and self-contained, but
 * lacks animation primitives, nested dialog stacking, and some edge-case
 * keyboard handling. Sufficient for matters.town's confirm/info/composer usage.
 */
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import type { HTMLAttributes, ReactElement, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import styles from "./Dialog.module.css";

export type DialogSize = "small" | "medium" | "large";

export interface DialogProps {
  /** Controls visibility. */
  open: boolean;
  /** Called when the user requests close (Escape, backdrop click, or close button). */
  onClose: () => void;
  /** Children: typically Dialog.Title + Dialog.Body + Dialog.Actions. */
  children: ReactNode;
  /** Width preset. */
  size?: DialogSize;
  /** If false, clicking the backdrop will NOT close the dialog. Default true. */
  closeOnBackdropClick?: boolean;
  /** If false, pressing Escape will NOT close the dialog. Default true. */
  closeOnEscape?: boolean;
  /** Element to focus when the dialog opens. Default: first focusable child. */
  initialFocusRef?: RefObject<HTMLElement>;
  /** Element to return focus to when the dialog closes. Default: previously-focused element. */
  returnFocusRef?: RefObject<HTMLElement>;
  /** Override the portal container. Default: document.body. */
  portalContainer?: Element | DocumentFragment;
  /** Pass-through className on the panel. */
  className?: string;
  /** ARIA labelling: provide one of `aria-labelledby` (preferred — point to your Dialog.Title id)
   * or `aria-label` (fallback). Dialog will auto-wire when you use Dialog.Title. */
  "aria-labelledby"?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

interface DialogContextValue {
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export const Dialog = Object.assign(
  forwardRef<HTMLDivElement, DialogProps>(function Dialog(props, ref) {
    const {
      open,
      onClose,
      children,
      size = "small",
      closeOnBackdropClick = true,
      closeOnEscape = true,
      initialFocusRef,
      returnFocusRef,
      portalContainer,
      className,
      "aria-labelledby": labelledByProp,
      "aria-label": ariaLabel,
      "aria-describedby": describedByProp,
    } = props;

    const panelRef = useRef<HTMLDivElement | null>(null);
    const reactId = useId();
    const titleId = `${reactId}-title`;
    const descriptionId = `${reactId}-description`;

    // Detect Dialog.Title / Dialog.Description in the children tree synchronously
    // (so aria-labelledby/aria-describedby can be wired on the very first paint).
    // Walks one level deep — Dialog.Title must be a direct or near-top child.
    const { hasTitle, hasDescription } = scanForLabelChildren(children);

    // Restore focus to previously-active element on close.
    const previouslyFocused = useRef<HTMLElement | null>(null);
    useEffect(() => {
      if (!open) return;
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Snapshot ref into a stable closure variable to satisfy
      // react-hooks/exhaustive-deps for cleanup.
      const consumerReturn = returnFocusRef?.current ?? null;
      return () => {
        const target = consumerReturn ?? previouslyFocused.current;
        target?.focus?.();
      };
    }, [open, returnFocusRef]);

    // Initial focus.
    useEffect(() => {
      if (!open) return;
      const t = setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
          return;
        }
        const panel = panelRef.current;
        if (!panel) return;
        const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (firstFocusable ?? panel).focus();
      }, 0);
      return () => clearTimeout(t);
    }, [open, initialFocusRef]);

    // Body scroll lock.
    useEffect(() => {
      if (!open) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [open]);

    // Keyboard handling: Escape + Tab focus trap.
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape" && closeOnEscape) {
          e.stopPropagation();
          onClose();
          return;
        }
        if (e.key !== "Tab") return;
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusables.length === 0) {
          e.preventDefault();
          panel.focus();
          return;
        }
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      },
      [closeOnEscape, onClose]
    );

    if (!open) return null;

    const ariaLabelledByResolved = labelledByProp ?? (hasTitle ? titleId : undefined);
    const ariaDescribedByResolved = describedByProp ?? (hasDescription ? descriptionId : undefined);

    const setRefs = (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    const node = (
      <div
        className={styles.backdrop}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && closeOnBackdropClick) {
            onClose();
          }
        }}
      >
        <DialogContext.Provider value={{ titleId, descriptionId }}>
          <div
            ref={setRefs}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledByResolved}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedByResolved}
            tabIndex={-1}
            className={clsx(styles.panel, styles[size], className)}
            onKeyDown={handleKeyDown}
          >
            {children}
          </div>
        </DialogContext.Provider>
      </div>
    );

    const container = portalContainer ?? (typeof document !== "undefined" ? document.body : null);
    return container ? createPortal(node, container) : node;
  }),
  {
    Title: DialogTitle,
    Description: DialogDescription,
    Body: DialogBody,
    Actions: DialogActions,
    ActionPrimary: DialogActionPrimary,
    ActionSecondary: DialogActionSecondary,
  }
);

(Dialog as unknown as { displayName: string }).displayName = "Dialog";

// ---------- subcomponents ----------

function DialogTitle({ children, className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  const ctx = useContext(DialogContext);
  return (
    <h2 id={ctx?.titleId} className={clsx(styles.title, className)} {...rest}>
      {children}
    </h2>
  );
}
DialogTitle.displayName = "Dialog.Title";

function DialogDescription({ children, className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  const ctx = useContext(DialogContext);
  return (
    <p id={ctx?.descriptionId} className={clsx(styles.description, className)} {...rest}>
      {children}
    </p>
  );
}
DialogDescription.displayName = "Dialog.Description";

// Walks one level into children (and one level into wrapper fragments / Dialog.Body)
// looking for Dialog.Title / Dialog.Description by component identity.
function scanForLabelChildren(node: ReactNode): {
  hasTitle: boolean;
  hasDescription: boolean;
} {
  let hasTitle = false;
  let hasDescription = false;
  const visit = (n: ReactNode, depth: number) => {
    if (depth > 3) return;
    Children.forEach(n, (child) => {
      if (!isValidElement(child)) return;
      const el = child as ReactElement;
      if (el.type === DialogTitle) hasTitle = true;
      else if (el.type === DialogDescription) hasDescription = true;
      else if (el.props && (el.props as { children?: ReactNode }).children) {
        visit((el.props as { children?: ReactNode }).children, depth + 1);
      }
    });
  };
  visit(node, 0);
  return { hasTitle, hasDescription };
}

function DialogBody({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx(styles.body, className)} {...rest}>
      {children}
    </div>
  );
}
DialogBody.displayName = "Dialog.Body";

function DialogActions({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx(styles.actions, className)} {...rest}>
      {children}
    </div>
  );
}
DialogActions.displayName = "Dialog.Actions";

function DialogActionPrimary({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={clsx(styles.actionPrimary, className)} {...rest}>
      {children}
    </button>
  );
}
DialogActionPrimary.displayName = "Dialog.ActionPrimary";

function DialogActionSecondary({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={clsx(styles.actionSecondary, className)} {...rest}>
      {children}
    </button>
  );
}
DialogActionSecondary.displayName = "Dialog.ActionSecondary";
