import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'HR_ADMIN') {
    redirect('/hr/dashboard');
  }

  if (session.role === 'EMPLOYEE') {
    redirect('/employee/dashboard');
  }

  redirect('/login');
}
