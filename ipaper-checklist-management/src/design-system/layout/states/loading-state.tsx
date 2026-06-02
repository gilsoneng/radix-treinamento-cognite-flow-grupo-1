import { IpSpinner } from '../../components/ip-spinner/ip-spinner';

export interface LoadingStateProps {
  message?: string;
}


export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="ip-loading-panel" aria-busy="true" aria-live="polite" role="status">
      <div className="ip-loading-panel__content">
        <IpSpinner alt="" size={48} />
        <span className="ip-loading-panel__message">{message}</span>
      </div>
    </div>
  );
}
