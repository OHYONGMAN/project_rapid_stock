'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { logoutHandler } from '../../utils/auth/logout.ts';
import Link from 'next/link';
import icoCloseArr from '../../../public/images/ico-closeArr.svg';
import icoOpenArr from '../../../public/images/ico-openArr.svg';
import icoSetting from '../../../public/images/ico-setting.svg';
import icoLogout from '../../../public/images/ico-logout.svg';
import icoLogin from '../../../public/images/ico-login.svg';
import icoUser from '../../../public/images/ico-user.svg';
import Chats from './components/Chats';
import UserInfo from '../UserInfo/UserInfo'; // UserInfo 컴포넌트 임포트

declare global {
  interface Window {
    updateRecentNews: () => void;
  }
}

export default function SideBar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null); // username 상태 추가
  const [recentNews, setRecentNews] = useState<{ id: number; title: string }[]>(
    [],
  ); // 뉴스 ID와 타이틀을 저장

  // 사용자 정보 업데이트 (username 포함)
  const handleUserChange = (email: string | null, username: string | null) => {
    setUserEmail(email);
    setUsername(username); // username을 업데이트
  };

  // 로컬 스토리지에서 최근 본 뉴스 가져오기
  const loadRecentNews = () => {
    const storedNewsHistory = JSON.parse(
      localStorage.getItem('newsHistory') || '[]',
    );
    setRecentNews(storedNewsHistory);
  };

  // 컴포넌트가 마운트될 때 최근 본 뉴스 로드 및 전역 함수 설정
  useEffect(() => {
    loadRecentNews();

    // 전역에서 호출할 수 있도록 함수 정의
    window.updateRecentNews = loadRecentNews;

    return () => {
      // 컴포넌트가 언마운트될 때 전역 함수 삭제
      delete window.updateRecentNews;
    };
  }, []);

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
        className={`fixed right-0 top-0 flex h-full w-[480px] flex-col items-center bg-g-100 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 리스트 섹션 */}
        <section className="pt-[36px]">
          {username ? (
            <p className="text-xl font-semibold">
              {username}님<br />
              Rapid Stock에 오신 것을 환영합니다!
            </p> // username으로 변경
          ) : (
            <p className="text-xl font-semibold">
              로그인하고
              <br />
              커뮤니티에 참여해보세요!
            </p>
          )}

          <div className="flex text-g-800 mt-4 gap-2">
            {userEmail ? (
              <>
                <Link
                  href="/mypage"
                  className="w-[172px] h-[42px] flex gap-2 items-center justify-center bg-g-200 rounded-lg"
                >
                  마이페이지
                  <Image src={icoSetting} alt="마이페이지" />
                </Link>
                <button
                  className="w-[172px] h-[42px] flex gap-2 items-center justify-center bg-g-200 rounded-lg"
                  onClick={logoutHandler}
                >
                  로그아웃
                  <Image src={icoLogout} alt="로그아웃" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-[172px] h-[42px] flex gap-2 items-center justify-center bg-g-200 rounded-lg"
                >
                  로그인
                  <Image src={icoLogin} alt="로그인" />
                </Link>
                <Link
                  href="/signup"
                  className="w-[172px] h-[42px] flex gap-2 items-center justify-center bg-g-200 rounded-lg"
                >
                  회원가입
                  <Image src={icoUser} alt="회원가입" />
                </Link>
              </>
            )}
          </div>
          <div className="relative mt-[65px] w-[360px] before:absolute before:-translate-y-[32px] before:h-[1px] before:w-[360px]  before:bg-g-400 before:content-['']">
            <h3 className="mb-2 text-xl font-semibold ">최근 본 뉴스</h3>
            <ul>
              {/* 최근 본 뉴스 타이틀 표시 */}
              {recentNews.length > 0 ? (
                recentNews.map((news) => (
                  <li key={news.id} className="mb-[8px]">
                    <a className="hover:text-red-500" href={`/news/${news.id}`}>
                      {news.title.length > 28
                        ? `${news.title.slice(0, 28)}...`
                        : news.title}
                    </a>
                  </li>
                ))
              ) : (
                <li>최근 본 뉴스가 없습니다.</li>
              )}
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
