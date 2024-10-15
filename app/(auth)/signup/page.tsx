'use client';

import { supabase } from '@/app/utils/supabase';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가
  const router = useRouter();

  const signupHandler = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // 에러 메시지 초기화

    try {
      // Supabase 회원가입 시도
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('회원가입 오류:', error.message);
        setErrorMessage(error.message); // 에러 메시지 출력
        return;
      }

      console.log('회원가입 성공:', data);

      const { user } = data;
      if (!user) {
        setErrorMessage('회원가입에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      // 회원가입 후 사용자 정보를 user 테이블에 저장
      const { error: userError } = await supabase.from('user').insert([
        {
          id: user.id, // Supabase 사용자 ID
          name,
          email,
        },
      ]);

      if (userError) {
        console.error('사용자 정보 저장 오류:', userError.message);
        setErrorMessage(userError.message);
      } else {
        console.log('사용자 정보 저장 성공');
        router.push('/'); // 성공 시 로그인 페이지로 리다이렉트
      }
    } catch (error) {
      console.error('오류 발생:', error);
      setErrorMessage('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex items-start justify-center h-screen mt-10 bg-white">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[980px] max-h-[640px] grid grid-cols-2">
        {/* 왼쪽 - 회원가입 폼 */}
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-2 text-black">
            Welcome to Rapid Stock!
          </h1>
          <p className="text-gray-600 mb-10">
            가장 빠르게 주식 뉴스를 전달드립니다.
          </p>

          {/* 에러 메시지 표시 */}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <form className="space-y-6" onSubmit={signupHandler}>
            <div>
              <label className="text-black font-medium">이메일</label>
              <input
                type="email"
                placeholder="이메일을 입력해주세요."
                className="w-full h-12 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-black font-medium">비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요."
                className="w-full h-12 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-black font-medium">닉네임</label>
              <input
                type="text"
                placeholder="닉네임을 입력해주세요."
                className="w-full h-12 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-black text-white rounded-md hover:bg-gray-800 transition duration-200"
            >
              회원가입
            </button>
          </form>
        </div>

        {/* 오른쪽 - 로고 이미지 */}
        <div className="flex items-center justify-center bg-gray-50 p-8 rounded-r-lg">
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

export default SignupForm;
