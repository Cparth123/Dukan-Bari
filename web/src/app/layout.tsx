import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Dukan Bari | Hyperlocal Store Discovery & Live Merchant Platform',
  description: 'Connect with local physical retail stores within 1-5 km. Live store open/close tracking, reverse enquiry broadcasts, and direct instant chat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
