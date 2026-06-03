import { Alert, AlertDescription } from '@cognite/aura/components';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}


export function ErrorState({ message, onRetry, retryLabel = 'Retry' }: ErrorStateProps) {
  return (
    <Alert>
      <AlertDescription>
        <div className="flex items-center justify-between gap-4">
          <span>{message}</span>
          {onRetry ? (
            <button type="button" className="link-fusion" onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
        </div>
      </AlertDescription>
    </Alert>
  );
}
