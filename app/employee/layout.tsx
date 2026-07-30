import React from 'react';
import { getCurrentUser } from '@/actions/auth';
import { EmployeeLayoutClient } from './EmployeeLayoutClient';

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <EmployeeLayoutClient user={user}>
      {children}
    </EmployeeLayoutClient>
  );
}
