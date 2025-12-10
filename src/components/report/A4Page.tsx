import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface A4PageProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function A4Page({ children, className, noPadding = false }: A4PageProps) {
  return (
    <div
      className={cn(
        "w-[210mm] min-h-[297mm] bg-white mx-auto shadow-2xl mb-8 overflow-hidden relative",
        "print:shadow-none print:mb-0",
        !noPadding && "p-[15mm]",
        className
      )}
      style={{ 
        pageBreakAfter: 'always',
        breakAfter: 'page'
      }}
    >
      {children}
    </div>
  );
}
