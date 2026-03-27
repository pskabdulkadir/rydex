import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageLayoutProps {
  title: string;
  backLink?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
}

export function PageLayout({
  title,
  backLink = "/",
  children,
  headerAction,
  className = "",
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-slate-100 ${className}`}>
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4 z-10">
        {backLink && (
          <Link to={backLink}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
        {headerAction && <div className="ml-auto">{headerAction}</div>}
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
