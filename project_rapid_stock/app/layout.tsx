import './globals.css';
import Header from '../components/Header';
import Head from 'next/head';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='ko-kr'>
            <Head>
                <title>{'Rapid Stock'}</title>
                <meta name='description' content={'증권 뉴스와 관련 주식 소식을 전달해드립니다.'} />
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
            </body>
        </html>
    );
}
