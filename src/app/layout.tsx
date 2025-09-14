import './globals.css';
import type { Metadata } from 'next';
import { SidebarProvider } from '@/components/Sidebar';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Strapi-style dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SidebarProvider>
          <Sidebar />
          <div className="md:pl-64">
            <Topbar />
            <main className="container mx-auto max-w-7xl p-4 md:p-6">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
