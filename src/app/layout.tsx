// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReconTex | D2C Home Textiles Multi-Channel Reconciliation & Recovery OS',
  description:
    'Financial reconciliation & revenue recovery platform for Company A (Bengaluru). Order-level settlement matching, COD remittance verification, courier freight audit, and lost returns tracking.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
