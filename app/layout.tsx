import '@/app/globals.css';
import Footer from '@/app/components/Footer/Footer';
import Header from '@/app/components/Header/Header';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rapid Stock',
  description: '증권 뉴스와 관련 주식 소식을 전달해드립니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full">
        <Header
          links={[
            { name: '뉴스룸', url: '/news' },
            { name: '커뮤니티', url: '/community' },
            { name: '모의투자', url: '/stock' },
          ]}
        />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
