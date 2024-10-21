'use client'; // this is a client component

import { supabase } from '../../utils/supabase.ts';
import { useRouter } from 'next/navigation'; // useRouter 임포트
import Image from 'next/image';
import React, { FormEvent, useState } from 'react';
import Link from 'next/link';

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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="grid items-center max-h-full h-[640px] w-full max-w-[980px] grid-cols-2 rounded-xl border border-g-400 border bg-white shadow-xl">
        {/* 왼쪽 - 로그인 폼 */}
        <div className="p-8">
          <h1 className="mb-2 text-2xl font-bold text-black">
            Welcome to Rapid Stock!
          </h1>
          <p className="mb-14 text-gray-600">
            가장 빠르게 주식 뉴스를 전달드립니다.
          </p>

          <form className="space-y-6" onSubmit={loginHandler}>
            <div>
              <label className="block font-medium text-black mb-[10px]">
                이메일
              </label>
              <input
                type="email"
                placeholder="이메일을 입력해주세요."
                className="h-12 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-black mb-[10px]">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요."
                className="h-12 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errorMessage && (
                <div className="text-red-600 mt-2">{errorMessage}</div>
              )}
            </div>
            <div>
              <div className="block mt-14">
                <button
                  type="submit"
                  className="h-12 w-full rounded-md bg-black text-white transition duration-200 hover:bg-gray-800"
                >
                  로그인
                </button>
              </div>
            </div>
          </form>
          <div className="flex mt-10 justify-center gap-2 text-g-600">
            <p>계정이 없으신가요?</p>
            <Link href="/signup" className="hover:underline">
              회원가입
            </Link>
          </div>
        </div>

        {/* 오른쪽 - 로고 이미지 */}
        <div className="flex items-center justify-center h-[640px] rounded-r-xl bg-gray-50 p-8">
          <div className="text-center">
            <Image
              src="/images/logo-2.svg"
              alt="Rapid Stock Logo"
              width={300}
              height={300}
              className="mx-auto mb-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
