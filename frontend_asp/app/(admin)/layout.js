import { Inter } from 'next/font/google';
import './admin.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'ASP Cranes | Admin CMS',
  description: 'Advanced Content Management System for ASP Cranes',
};

export default function AdminRootLayout({ children }) {
  return (
    <div
      className={`${inter.variable}`}
      style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
    >
      <div className="admin-root">
        {children}
      </div>
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#f1f5f9',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
          },
          success: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
  );
}
