import { IP_SPINNER_SRC } from '../../assets/ip-brand';

export interface IpSpinnerProps {
  alt?: string;
  size?: number;
}


export function IpSpinner({ alt = 'Loading', size = 32 }: IpSpinnerProps) {
  return (
    <img
      src={IP_SPINNER_SRC}
      alt={alt}
      width={size}
      height={size}
      className="ip-spinner shrink-0"
      aria-hidden={alt === '' ? true : undefined}
    />
  );
}
