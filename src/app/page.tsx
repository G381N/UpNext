import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/folders');
  return null;
}
