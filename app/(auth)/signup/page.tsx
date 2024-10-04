"use client"; // this is a client component

import { supabase } from "@/app/utils/supabase"; 
import { FormEvent, useState } from "react";
import Logo from '../../../public/logo.svg';
import Image from 'next/image';

const SignupForm = () =>{
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupHandler = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Signup handler called"); 
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        console.error(error);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error(error);
    }
  };
}

  export default function SignupPage() {
    return (
      <div className="flex items-start justify-center h-screen mt-10 bg-white">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[980px] max-h-[640px] grid grid-cols-2">
          {/* 왼쪽 - 회원가입 폼 */}
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-2 text-black">Welcome to Rapid Stock!</h1>
            <p className="text-gray-600 mb-10">가장 빠르게 주식 뉴스를 전달드립니다.</p>
  
            <form className="space-y-6">
              <div>
                <label className="text-black font-medium" >이메일</label>
                <input
                  type="email"
                  placeholder="이메일을 입력해주세요."
                  className="w-full h-12 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-black font-medium">비밀번호</label>
                <input
                  type="password"
                  placeholder="비밀번호를 입력해주세요."
                  className="w-full h-12 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-black font-medium">닉네임</label>
                <input
                  type="text"
                  placeholder="닉네임을 입력해주세요."
                  className="w-full h-12 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-black font-medium">전화번호</label>
                <input
                  type="tel"
                  placeholder="전화번호를 입력해주세요."
                  className="w-full h-12 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
            <img src="/images/logo.svg" alt="Rapid Stock Logo" className="w-[500px] mx-auto mb-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }