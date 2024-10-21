'use client';

import React, { useState } from 'react';
import ProfileEditModal from './components/ProfileEditModal';

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100 p-4">
      {/* 왼쪽 사용자 정보 */}
      <div className="mr-4 w-1/4 rounded-lg bg-white p-6 shadow-lg">
        <img
          src="https://via.placeholder.com/150"
          alt="프로필 이미지"
          className="w-32 h-32 rounded-full mx-auto mb-4"
        />
        <p className="mb-4 text-center">닉네임: 부자되구싶ㅇㅅㅇ</p>
        <p>이메일: example@example.com</p>
        <div className="mb-4 flex justify-center">
          <label className="inline-flex items-center">
            <input type="checkbox" className="form-checkbox" />
            <span className="ml-2">알림 설정</span>
          </label>
        </div>

        <button
          onClick={openModal}
          className="w-full rounded bg-blue-500 px-4 py-2 text-white"
        >
          프로필 수정하기
        </button>
      </div>

      {/* 프로필 수정 모달 */}
      <ProfileEditModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default Page;
