'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import icoCloseArr from '../../../public/images/ico-closeArr.svg';
import icoOpenArr from '../../../public/images/ico-openArr.svg';
import Chats from './components/Chats';
import UserInfo from './components/UserInfo'; // UserInfo 컴포넌트 임포트

export default function SideBar() {
  const [selectedButton, setSelectedButton] = useState<string>('recent');
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
          <div>
            {/* 최근 리스트 버튼 */}
            <button
              className={`box-border h-[52px] w-[180px] ${
                selectedButton === 'recent' ? 'border-b-4 border-black' : ''
              }`}
              onClick={() => setSelectedButton('recent')}
            >
              최근 리스트
            </button>

            {/* 관심 리스트 버튼 */}
            <button
              className={`box-border h-[52px] w-[180px] ${
                selectedButton === 'interest' ? 'border-b-4 border-black' : ''
              }`}
              onClick={() => setSelectedButton('interest')}
            >
              관심 리스트
            </button>
          </div>

          {/* 로그인 상태에 따라 표시할 텍스트 */}
          <div className="pt-3">
            {userEmail ? (
              <>
                <div>삼성전자</div>
                <div>삼성전자</div>
                <div>삼성전자</div>
                <div>삼성전자</div>
                <div>삼성전자</div>
              </>
            ) : (
              <>
                <p>로그인 후 조회 가능합니다.</p>
              </>
            )}
          </div>
        </section>

        {/* UserInfo 컴포넌트 */}
        <UserInfo onUserChange={handleUserChange} />

        <Chats />
      </aside>
    </div>
  );
}
