import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'KnitTrack Tiruppur | Production & TNA Delay Projection System',
  description: 'Production tracking, Time-and-Action milestones, and run-rate delay warning system for Tiruppur knitwear exporters.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('knittrack_theme');
                if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FAF8F5] dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Company A, Tiruppur</span> — 3 Units + Subcontract Printing & Washing (900 Workers)
            </div>
            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 font-medium">
              <span>Annual Revenue: ₹95–110 Cr</span>
              <span>•</span>
              <span>500 Orders/Year</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Target: Late Shipments 8% → 5%</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
