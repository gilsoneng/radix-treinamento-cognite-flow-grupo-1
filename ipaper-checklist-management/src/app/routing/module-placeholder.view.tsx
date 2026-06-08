import { EmptyState } from '../../design-system/layout/states/empty-state';

export type ModulePlaceholderViewProps = {
  title: string;
  description: string;
};

export function ModulePlaceholderView({ title, description }: ModulePlaceholderViewProps) {
  return <EmptyState title={title} description={`${description} Coming soon.`} />;
}
