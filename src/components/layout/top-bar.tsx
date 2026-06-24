import { Logo } from '@/components/common/logo';
import { SearchBar } from '@/components/common/search-bar';
import { SocialIcons } from '@/components/common/social-icons';
import { SITE } from '@/config/constants';

export function TopBar() {
  return (
    <div className="border-b border-surface-100 bg-white">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-4 px-4 py-5 sm:grid-cols-3">
        <div className="order-2 flex justify-center sm:order-1 sm:justify-start">
          <SocialIcons variant="navy" />
        </div>
        <div className="order-1 flex flex-col items-center sm:order-2">
          <Logo />
          <p className="mt-1 text-sm text-muted">{SITE.tagline}</p>
        </div>
        <div className="order-3 flex justify-center sm:justify-end">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
