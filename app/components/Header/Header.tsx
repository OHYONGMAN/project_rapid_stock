'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { logoutHandler } from '../../utils/auth/logout.ts';
import UserInfo from '../Sidebar/components/UserInfo.tsx';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  links?: { name: string; url: string }[];
}

const Header: React.FC<HeaderProps> = ({ links = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter(); // useRouter를 사용하여 URL 이동

  // 사용자 이메일 업데이트
  const handleUserChange = (email: string | null) => {
    setUserEmail(email);
  };

  // 검색어 처리 함수
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      router.push(`/news?search=${encodeURIComponent(searchTerm)}`); // 검색어를 쿼리 파라미터로 추가
    }
  };

  return (
    <header className="border-b border-g-400">
      <UserInfo onUserChange={handleUserChange} />
      <div className="container mx-auto flex items-center justify-between py-6">
        <h1>
          <Link href="/">
            <Image
              src="/images/logo.svg"
              alt="rapid stock"
              width={190}
              height={34}
            />
          </Link>
        </h1>
        <nav>
          <ul className="flex gap-12 text-lg font-semibold md:gap-4">
            {links.map((link) => (
              <li key={`${link.name}-${link.url}`}>
                <Link href={link.url}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <form
          onSubmit={handleSearch}
          className="flex h-[45px] w-5/12 rounded-full bg-g-100 px-6 py-2.5"
        >
          <input
            type="text"
            placeholder="검색"
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="h-full" aria-label="검색하기">
            <Image
              src="/images/ico-search.svg"
              alt="검색 아이콘"
              width={18}
              height={18}
            />
          </button>
        </form>
        <div className="text-g-600">
          {userEmail ? (
            <>
              <Link href="/mypage" className="mr-12 md:mr-4">
                마이페이지
              </Link>
              <button className="text-g-600" onClick={logoutHandler}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-12 md:mr-4">
                로그인
              </Link>
              <Link href="/signup">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
