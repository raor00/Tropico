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
      className="panel group relative flex flex-col gap-2 overflow-hidden p-3 transition hover:border-tropico-sun/40 md:gap-3 md:p-5"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 transition group-hover:opacity-100`}
      />
      <div className="relative flex flex-col gap-2 md:gap-3">
        <div className="flex items-start justify-between">
          <div className="flex size-8 items-center justify-center rounded-lg bg-tropico-ink/60 text-tropico-sun ring-1 ring-tropico-sun/20 transition group-hover:ring-tropico-sun/50 md:size-12 md:rounded-xl">
            <Icon className="size-4 md:size-6" strokeWidth={2} aria-hidden="true" />
          </div>
          {badge && (
            <span className="rounded-md bg-tropico-ink/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-tropico-mute md:text-[10px]">
              {badge}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-display text-sm font-bold leading-tight md:text-lg">
            {titulo}
          </h3>
          <p
            className="mt-0.5 hidden text-xs leading-snug text-tropico-mute sm:block md:mt-1 md:text-sm"
            dangerouslySetInnerHTML={{ __html: descripcion }}
          />
        </div>
      </div>
    </Link>
  );
}
