import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export type { PageHeaderProps };

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-headline font-bold text-primary">{title}</h1>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
    </div>
  );
}