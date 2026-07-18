import Link from "next/link";
import { ph } from "@/lib/utils";
import type { Project } from "@/data/projects";
import type { Product } from "@/data/products";

export function CaseCard({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <Link
      href={`/projects/${project.slug}/`}
      className="group block overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-line-strong"
    >
      <div className={large ? "aspect-[16/9] overflow-hidden" : "aspect-[4/3] overflow-hidden"}>
        {/* TODO: заменить на фото объекта заказчика */}
        <img
          src={ph(project.seed, large ? 1400 : 900, large ? 800 : 680)}
          alt={`${project.name}, ${project.city}`}
          loading="lazy"
          className="ph h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
        <p className="font-display text-lg leading-snug font-medium">{project.name}</p>
        <p className="mt-3 font-mono text-sm text-mute">
          {project.city} · {project.area} · {project.term}
        </p>
        <p className="mt-3 text-sm text-mute">{project.systems.join(", ")}</p>
      </div>
    </Link>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/catalog/${product.category}/${product.slug}/`}
      className="group flex flex-col overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-line-strong"
    >
      <div className="aspect-[4/3] overflow-hidden">
        {/* TODO: заменить на фото/рендер изделия */}
        <img
          src={ph(product.seed, 900, 680)}
          alt={product.name}
          loading="lazy"
          className="ph h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex grow flex-col p-6">
        <p className="font-display leading-snug font-medium">{product.name}</p>
        <p className="mt-3 grow text-sm text-mute">{product.short}</p>
        <p className="mt-5 font-mono text-lg font-medium text-copper-soft">{product.price}</p>
      </div>
    </Link>
  );
}
