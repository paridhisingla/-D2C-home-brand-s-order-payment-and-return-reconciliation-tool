import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'KnitTrack Tiruppur | Production & TNA Delay Projection System',
  description: 'Production tracking, Time-and-Action milestones, and run-rate delay warning system for Tiruppur knitwear exporters.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-700">Company A, Tiruppur</span> — 3 Units + Subcontract Printing & Washing (900 Workers)
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Annual Revenue: ₹95–110 Cr</span>
              <span>•</span>
              <span>500 Orders/Year</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">Target: Late Shipments 8% → 5%</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
