'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import icoCloseArr from '../../../public/images/ico-closeArr.svg';
import icoOpenArr from '../../../public/images/ico-openArr.svg';
import Chats from './components/Chats';
import UserInfo from './components/UserInfo'; // UserInfo 컴포넌트 임포트

export default function SideBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null); // 사용자 이메일 상태

  // 사용자 이메일 업데이트
  const handleUserChange = (email: string | null) => {
    setUserEmail(email);
  };

  return (
    <div>
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-[36px] top-[29px] z-50 rounded-lg hover:bg-g-200"
      >
        {isOpen ? (
          <Image src={icoCloseArr} alt="닫기" />
        ) : (
          <Image src={icoOpenArr} alt="열기" />
        )}
      </button>

      {/* 사이드바 */}
      <aside
        className={`fixed right-0 top-0 flex h-full w-[480px] flex-col items-center gap-10 bg-g-100 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 리스트 섹션 */}
        <section className="pt-[36px] ">
          {userEmail ? (
            <p className="text-center">{userEmail}님 환영합니다.</p>
          ) : (
            <p className="text-center">환영합니다.</p>
          )}
          <div className="w-[360px] pt-5">
            <h3 className="mb-2 text-xl font-bold">최근 본 뉴스</h3>
            <ul>
              <li>삼성전자</li>
              <li>삼성전자</li>
              <li>삼성전자</li>
              <li>삼성전자</li>
              <li>삼성전자</li>
            </ul>
          </div>
        </section>

        {/* UserInfo 컴포넌트 */}
        <UserInfo onUserChange={handleUserChange} />

        <Chats />
      </aside>
    </div>
  );
}
