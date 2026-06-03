import { IP_HERO_SRC, IP_LOGO_WHITE_SRC, RADIX_WEDGE_SRC } from '../../assets/ip-brand';

export interface IpHeroBannerProps {
  appName: string;
  pageTitle: string;
}


export function IpHeroBanner({ appName, pageTitle }: IpHeroBannerProps) {
  return (
    <section
      className="ip-hero-banner"
      style={{ backgroundImage: `url(${IP_HERO_SRC})` }}
      aria-labelledby="ip-hero-page-title"
    >
      <img src={RADIX_WEDGE_SRC} alt="Radix" className="ip-hero-banner__radix-wedge" />
      <div className="ip-hero-banner__brand">
        <img src={IP_LOGO_WHITE_SRC} alt="International Paper" className="ip-hero-banner__logo" />
        <div className="ip-hero-banner__titles">
          <p className="ip-hero-banner__app-name">{appName}</p>
          <h1 id="ip-hero-page-title" className="ip-hero-banner__page-title">
            {pageTitle}
          </h1>
        </div>
      </div>
    </section>
  );
}
