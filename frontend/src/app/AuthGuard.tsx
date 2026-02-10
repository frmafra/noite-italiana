'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ROTAS_PUBLICAS = ['/', '/login', '/convite'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (ROTAS_PUBLICAS.includes(pathname || '')) return;
    const user = localStorage.getItem('portal_user');
    if (!user) {
      router.replace('/login');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
