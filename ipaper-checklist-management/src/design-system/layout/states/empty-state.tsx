import { Card, CardContent } from '@cognite/aura/components';

export interface EmptyStateProps {
  title: string;
  description?: string;
}


export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-center gap-1 py-8 text-center">
          <span className="text-lg font-medium">{title}</span>
          {description ? <span className="text-muted-foreground">{description}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
