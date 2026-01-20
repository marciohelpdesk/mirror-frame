import { ReactNode } from 'react';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  rightElement?: ReactNode;
  leftElement?: ReactNode;
}

export const PageHeader = ({ title, subtitle, rightElement, leftElement }: PageHeaderProps) => {
  return (
    <header className="flex justify-between items-start p-6 pb-4">
      <div className="flex items-center gap-3">
        {leftElement}
        <div>
          {subtitle && (
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {subtitle}
            </p>
          )}
          {title && (
            <h1 className="text-2xl font-light text-foreground tracking-tight">
              {title}
            </h1>
          )}
        </div>
      </div>
      {rightElement}
    </header>
  );
};
