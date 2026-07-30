import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { HRLayoutClient } from './HRLayoutClient';

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <HRLayoutClient user={user}>
      {children}
    </HRLayoutClient>
  );
}
