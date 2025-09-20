import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  pageTitle: string;
  breadcrumbs?: BreadcrumbItem[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, breadcrumbs }) => {
  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    const items = breadcrumbs ? [...breadcrumbs] : [];

    if (pageTitle && (!items.length || items[items.length - 1]?.label !== pageTitle)) {
      items.push({ label: pageTitle });
    }

    return items;
  }, [breadcrumbs, pageTitle]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              href="/"
            >
              Home
            </Link>
          </li>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const textClass = isLast
              ? "text-gray-800 dark:text-white/90"
              : "text-gray-500 dark:text-gray-400";

            return (
              <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5 text-sm">
                <svg
                  className="stroke-current"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="#98a2b3"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item.href ? (
                  <Link className={textClass} href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={textClass}>{item.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
