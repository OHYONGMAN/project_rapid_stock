import '@/app/globals.css';
import Head from 'next/head';
import Footer from '@/app/components/Footer/Footer';
import Header from '@/app/components/Header/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <title>{'Rapid Stock'}</title>
        <meta
          name="description"
          content={'증권 뉴스와 관련 주식 소식을 전달해드립니다.'}
        />
      </Head>
      <body>
        <Header
          links={[
            { name: '뉴스룸', url: '/news' },
            { name: '커뮤니티', url: '/community' },
            { name: '모의투자', url: '/stock' },
          ]}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
