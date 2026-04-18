import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="text-sm text-[#8A8A8A]">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && <span className="px-1 text-[#DCDCDC]">&gt;</span>}
              {isLast || !item.href ? (
                <span className="font-semibold text-[#142963]">{item.label}</span>
              ) : (
                <Link href={item.href} className="transition hover:text-[#2FA14B]">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
