import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TURNOFA | Agenda Inteligente para Estética de Pies',
  description: 'Sistema de recepción y agenda inteligente para estética de pies, pedicuría clínica y spa podológico. Gestión de clientes (DNI, Gmail, teléfono) y recordatorios automáticos por correo.',
  metadataBase: new URL('https://turnofacilia.online'),
  openGraph: {
    title: 'TURNOFA - Agenda de Recepción para Estética de Pies',
    description: 'Control de citas, calendario podológico y recordatorios por Gmail 24h antes y en el momento del turno.',
    url: 'https://turnofacilia.online',
    siteName: 'TURNOFA',
    locale: 'es_AR',
    type: 'website',
  },
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/turnofa-icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    shortcut: '/turnofa-icon.svg',
    apple: '/turnofa-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="min-h-screen bg-slate-50/60 text-slate-900 antialiased selection:bg-teal-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
