'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AppContext';
import { canAccess } from '@/types/business-access';

export default function BusinessAccessGate({children}:{children:React.ReactNode}) {
  const path = usePathname();
  const {user,isAuthenticated} = useAuth();
  if (!isAuthenticated) return <>{children}</>;
  let allowed = true;
  if (path.startsWith('/account/team')) allowed = user?.access?.isOwner === true;
  else if (path.startsWith('/account/orders')) allowed = canAccess(user?.access,'orderHistory');
  else if (path.startsWith('/account/inventory')) allowed = canAccess(user?.access,'inventory');
  else if (path.startsWith('/account/dealership/orders')) allowed = canAccess(user?.access,'orderHistory');
  else if (path.startsWith('/account/dealership')) allowed = user?.access?.isOwner === true || canAccess(user?.access,'inventory') || canAccess(user?.access,'orderHistory');
  else if (path.startsWith('/quotations')) allowed = canAccess(user?.access,'quotation');
  if (allowed) return <>{children}</>;
  return <main className="mx-auto max-w-xl p-10"><h1 className="text-2xl font-semibold">Access unavailable</h1><p className="my-4">Ask your business owner to enable this module for your account.</p><Link href="/account/dashboard">Back to account</Link></main>;
}
