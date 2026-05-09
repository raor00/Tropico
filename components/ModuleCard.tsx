import Link from "next/link";
import { type LucideIcon } from "lucide-react";

export type ModuleCardProps = {
  href: string;
  Icon: LucideIcon;
  titulo: string;
  descripcion: string;
  gradient: string;
  badge?: string;
};

export function ModuleCard({
  href,
  Icon,
  titulo,
  descripcion,
  gradient,
  badge,
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="panel group relative flex flex-col gap-3 overflow-hidden p-4 transition hover:border-tropico-sun/40 md:p-5"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 transition group-hover:opacity-100`}
      />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex size-10 items-center justify-center rounded-xl bg-tropico-ink/60 text-tropico-sun ring-1 ring-tropico-sun/20 transition group-hover:ring-tropico-sun/50 md:size-12">
            <Icon className="size-5 md:size-6" strokeWidth={1.75} aria-hidden="true" />
          </div>
          {badge && (
            <span className="rounded-md bg-tropico-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-tropico-mute">
              {badge}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-display text-base font-bold leading-tight md:text-lg">
            {titulo}
          </h3>
          <p
            className="mt-1 text-xs leading-relaxed text-tropico-mute md:text-sm"
            dangerouslySetInnerHTML={{ __html: descripcion }}
          />
        </div>
      </div>
    </Link>
  );
}
