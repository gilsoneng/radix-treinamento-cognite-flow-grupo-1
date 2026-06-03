import { Card, CardContent, CardHeader, CardTitle } from '@cognite/aura/components';
import type { ReactNode } from 'react';

export type ChartCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="border-b border-border py-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">{children}</CardContent>
    </Card>
  );
}
