import { PrimaryNav } from '@/components/layout/primary-nav';
import { TopBar } from '@/components/layout/top-bar';

export function Header() {
  return (
    <header>
      <TopBar />
      <PrimaryNav />
    </header>
  );
}
