'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import icoProfile from '../../../public/images/ico-profile.svg';
import icoCloseArr from '../../../public/images/ico-closeArr.svg';
import icoOpenArr from '../../../public/images/ico-openArr.svg';

export default function SideBar() {
  const [message, setMessage] = useState<string>('');
  const [selectedButton, setSelectedButton] = useState<string>('recent'); // 현재 선택된 버튼 상태 추가
  const [isOpen, setIsOpen] = useState<boolean>(false); // 사이드바 열림/닫힘 상태 추가

  // handleSubmit 함수의 타입 지정
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(message);
    setMessage('');
  };

  // onChange 함수의 타입 지정
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    console.log(e.target.value);
  };

  return (
    <div>
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-[29px] right-[36px] z-50 hover:bg-g-200 rounded-lg"
      >
        {isOpen ? (
          <Image src={icoCloseArr} alt="닫기" />
        ) : (
          <Image src={icoOpenArr} alt="열기" />
        )}
      </button>

      {/* 사이드바 */}
      <aside
        className={`fixed flex flex-col gap-10 items-center top-0 right-0 w-[480px] h-full bg-g-100 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 로그인 섹션 */}
        <section className="flex flex-col gap-4 pt-[60px]">
          <p className="text-xl">
            로그인하고
            <br />
            관심 뉴스 속보를 받아보세요!
          </p>
          <Link
            href="/login"
            className="px-[100px] py-[10px] bg-g-300 rounded-lg"
          >
            로그인하기
          </Link>
        </section>

        {/* 리스트 섹션 */}
        <section>
          <div>
            {/* 최근 리스트 버튼 */}
            <button
              className={`w-[180px] h-[52px] box-border ${
                selectedButton === 'recent' ? 'border-b-4 border-black' : ''
              }`}
              onClick={() => setSelectedButton('recent')}
            >
              최근 리스트
            </button>

            {/* 관심 리스트 버튼 */}
            <button
              className={`w-[180px] h-[52px] box-border ${
                selectedButton === 'interest' ? 'border-b-4 border-black' : ''
              }`}
              onClick={() => setSelectedButton('interest')}
            >
              관심 리스트
            </button>
          </div>
          <p className="pt-3">로그인 후 조회 가능합니다.</p>
        </section>

        {/* 실시간 채팅 섹션 */}
        <section className="w-[360px] h-[656px]">
          <h3>실시간 채팅</h3>
          <ul>
            <li>
              <div className="flex justify-between">
                <Image src={icoProfile} alt="프로필 아이콘" />
                <h4>오용민</h4>
                <span>09.24 14:32:40</span>
              </div>
              <p className="mt-2 py-3 px-4 bg-white rounded-lg">
                내 롤티어 아이언. 주식 이름도 아이언. 날 먹여주리라 믿는다
              </p>
            </li>
          </ul>
          <form className="flex mt-4" onSubmit={handleSubmit}>
            <input
              type="text"
              className="flex-grow px-4 py-2 border rounded-l-lg"
              placeholder="글을 작성해주세요."
              value={message}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-r-lg"
            >
              전송
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}
