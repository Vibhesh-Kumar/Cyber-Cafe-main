import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn("bg-secondary px-4 py-12 sm:px-6 lg:px-8", className)}>
      <div className="container mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold font-serif text-white sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-4 text-lg text-secondary-foreground/80">{description}</p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  );
}
