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
      className="panel group relative flex flex-col gap-2 overflow-hidden p-3 transition hover:border-tropico-sun/30 md:p-4"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 transition group-hover:opacity-100`}
      />
      <div className="relative flex flex-col gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-tropico-ink/60 text-tropico-sun ring-1 ring-tropico-sun/20 transition group-hover:ring-tropico-sun/50 md:size-10">
          <Icon className="size-4 md:size-5" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-display text-sm font-bold leading-tight md:text-base">
            {titulo}
          </h3>
          <p
            className="mt-0.5 text-[11px] leading-snug text-tropico-mute md:text-xs"
            dangerouslySetInnerHTML={{ __html: descripcion }}
          />
        </div>
      </div>
    </Link>
  );
}
