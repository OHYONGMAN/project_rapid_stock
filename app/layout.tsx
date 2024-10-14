import { Metadata } from 'next';
import React from 'react';
import 'devextreme/dist/css/dx.light.css';
import '@/app/globals.css';
import Footer from '@/app/components/Footer/Footer';
import Header from '@/app/components/Header/Header';

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
    <html lang="ko-KR">
      <body className="flex min-h-full flex-col">
        <Header
          links={[
            { name: '뉴스룸', url: '/news' },
            { name: '커뮤니티', url: '/community' },
            { name: '모의투자', url: '/stock' },
          ]}
        />
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
