import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, eyebrow, description, actions }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? <div className="label-eyebrow">{eyebrow}</div> : null}
        <h1 className="font-display text-xl font-bold uppercase tracking-wider leading-tight md:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
