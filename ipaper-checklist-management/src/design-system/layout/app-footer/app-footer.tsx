import { PoweredByRadix } from '../../components/powered-by-radix/powered-by-radix';

const RIGHTS_HOLDER = 'International Paper';


export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="ip-app-footer">
      <PoweredByRadix />
      <p className="ip-app-footer__rights">
        © {year} {RIGHTS_HOLDER}. All rights reserved.
      </p>
    </footer>
  );
}
