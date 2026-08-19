import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HX Engineering',
  description: 'Next-generation CFD and MBSE engineering platform - Engineering Without the Barriers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans selection:bg-white selection:text-black">{children}</body>
    </html>
  );
}