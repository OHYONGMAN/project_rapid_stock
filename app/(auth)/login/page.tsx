'use client'; // this is a client component

import { supabase } from '../../utils/supabase.ts';
import { useRouter } from 'next/navigation'; // useRouter 임포트
import Image from 'next/image';
import React, { FormEvent, useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가
  const router = useRouter(); // useRouter 사용

  const loginHandler = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // 로그인 시도 시 에러 메시지 초기화

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMessage('이메일 또는 비밀번호가 잘못되었습니다.');
      } else {
        setErrorMessage('로그인에 실패했습니다. 다시 시도해주세요.');
      }
      return;
    }

    if (data) {
      // 실제로 이곳에서 상태 관리 도구 사용 시 필요합니다.
      // 예: Redux나 Context API
      dispatch({
        type: 'LOGIN',
        payload: { email: data.user?.email, id: data.user?.id },
      });
      // 로그인 성공 시 홈 페이지로 이동
      router.push('/');
    }
  };

  // 임시 dispatch 함수 (추후 실제 구현 필요)
  function dispatch(arg0: {
    type: string;
    payload: { email: string | undefined; id: string | undefined };
  }) {
    console.log('Dispatch action:', arg0); // 실제 사용 시 이 부분을 구현해야 합니다.
  }

  return (
    <div className="mt-10 flex h-screen items-start justify-center bg-white">
      <div className="grid max-h-[640px] w-full max-w-[980px] grid-cols-2 rounded-lg bg-white shadow-xl">
        {/* 왼쪽 - 로그인 폼 */}
        <div className="p-4">
          <h1 className="mb-2 text-2xl font-bold text-black">
            Welcome to Rapid Stock!
          </h1>
          <p className="mb-10 text-gray-600">
            가장 빠르게 주식 뉴스를 전달드립니다.
          </p>

          {errorMessage && ( // 에러 메시지가 있을 경우 화면에 표시
            <div className="text-red-600">{errorMessage}</div>
          )}

          <form className="space-y-6" onSubmit={loginHandler}>
            <div>
              <label className="font-medium text-black">이메일</label>
              <input
                type="email"
                placeholder="이메일을 입력해주세요."
                className="h-12 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)} // 이메일 상태 업데이트
              />
            </div>
            <div>
              <label className="font-medium text-black">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요."
                className="h-12 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)} // 비밀번호 상태 업데이트
              />
            </div>
            <button
              type="submit"
              className="h-12 w-full rounded-md bg-black text-white transition duration-200 hover:bg-gray-800"
            >
              로그인
            </button>
          </form>
        </div>

        {/* 오른쪽 - 로고 이미지 */}
        <div className="flex items-center justify-center rounded-r-lg bg-gray-50 p-8">
          <div className="text-center">
            <Image
              src="/images/logo.svg"
              alt="Rapid Stock Logo"
              width={500}
              height={500}
              className="mx-auto mb-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
