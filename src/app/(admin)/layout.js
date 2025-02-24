import { Barlow, Quattrocento, Satisfy } from 'next/font/google';
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-barlow',
});

const quattrocento = Quattrocento({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-quattrocento',
});

const satisfy = Satisfy({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-satisfy',
});
export default function AdminLayout({ children }) {
  
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
