import { cn } from "@/lib/utils";

const controlCls =
  "w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-dim focus:border-copper focus:outline-none transition-colors min-h-11";

export function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-mute">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-err">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlCls, className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlCls, "appearance-none", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlCls, "min-h-24 resize-y", className)} {...props} />;
}
