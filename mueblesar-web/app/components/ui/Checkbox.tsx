import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Checkbox({ label, className = "", ...props }: Props) {
  return (
    <label className={`flex items-center gap-2 text-sm text-slate-800 ${className}`}>
      <input
        type="checkbox"
        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
