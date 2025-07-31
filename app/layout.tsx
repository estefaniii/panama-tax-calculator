import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Calculadora de Impuestos - Panamá',
  description: 'Calculadora de impuestos sobre la renta personal para la República de Panamá',
  generator: 'v0.dev',
  icons: {
    icon: '/tax.PNG',
    shortcut: '/tax.PNG',
    apple: '/tax.PNG',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}