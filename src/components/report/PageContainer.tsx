import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * PageContainer - A rigid A4 page wrapper for PDF-perfect rendering
 * Forces exact A4 dimensions (210mm x 297mm) with proper page breaks
 */
export function PageContainer({ children, className, noPadding = false }: PageContainerProps) {
  return (
    <div
      className={cn(
        // Fixed A4 dimensions
        "w-[210mm] h-[297mm] bg-white mx-auto relative overflow-hidden",
        // Screen styling
        "shadow-2xl mb-10",
        // Print styling
        "print:shadow-none print:mb-0 print:break-after-always",
        // Optional padding
        !noPadding && "p-[15mm]",
        className
      )}
      style={{ 
        pageBreakAfter: 'always',
        breakAfter: 'page',
        minHeight: '297mm',
        maxHeight: '297mm'
      }}
    >
      {children}
    </div>
  );
}
