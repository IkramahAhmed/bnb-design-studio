import type { ComponentProps } from 'react';

type Variant = 'primary' | 'ghost' | 'small';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'btn',
  ghost: 'btn ghost',
  small: 'btn btn-sm',
};

interface ButtonProps extends ComponentProps<'a'> {
  variant?: Variant;
}

/** A link styled as a button. Use `<SubmitButton>` for form submits. */
export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <a className={[VARIANT_CLASS[variant], className].filter(Boolean).join(' ')} {...props} />;
}
