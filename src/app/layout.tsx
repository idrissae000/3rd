import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Idriss Music Promos HQ',
  description: 'Automated workflow HQ for music promotion operations.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
