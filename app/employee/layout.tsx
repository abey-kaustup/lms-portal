import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { EmployeeSidebar } from '@/components/layout/EmployeeSidebar';
import { ToastProvider } from '@/components/ui/Toast';

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    redirect('/login');
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar session={session} />
        <div className="flex flex-1">
          <EmployeeSidebar />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
