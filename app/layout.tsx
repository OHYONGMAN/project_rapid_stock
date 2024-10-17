'use client';

import React, { useState } from 'react';
import 'devextreme/dist/css/dx.light.css';
import './globals.css';
import Footer from './components/Footer/Footer.tsx';
import Header from './components/Header/Header.tsx';
import SideBar from './components/Sidebar/Sidebar.tsx';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false); // 사이드바 상태 관리

  return (
    <html lang="ko-KR">
      <body
        className={`flex min-h-full flex-col grow transition-all duration-300 ${
          isSideBarOpen ? 'mr-[480px]' : 'ml-0'
        }`}
      >
        <Header
          links={[
            { name: '뉴스룸', url: '/news' },
            { name: '커뮤니티', url: '/community' },
            { name: '모의투자', url: '/stock' },
          ]}
        />
        <div className="relative flex flex-grow">
          {/* 메인 콘텐츠 */}
          <main
            className={`flex min-h-full flex-col grow transition-all duration-300 ${
              isSideBarOpen ? 'mx-[80px]' : 'ml-0'
            }`}
          >
            {children}
          </main>

          {/* 사이드바 */}
          <SideBar isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} />
        </div>
        <Footer />
      </body>
    </html>
  );
}
