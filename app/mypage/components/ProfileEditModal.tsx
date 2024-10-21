import React, { useState } from 'react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}
// ProfileEditModal 컴포넌트 정의

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [nickname, setNickname] = useState('부자되구싶ㅇㅅㅇ');
  const [email, setEmail] = useState('example@example.com');

  // 이미지 파일 상태 추가
  const [profileImage, setProfileImage] = useState<File | null>(null); //
  const [imagePreview, setImagePreview] = useState<string | null>(null); //

  // 이미지 파일 선택 시 처리 함수 추가
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //
    const file = e.target.files?.[0]; //
    if (file) {
      //
      setProfileImage(file); //
      setImagePreview(URL.createObjectURL(file)); // 이미지 미리보기 설정
    } //
  }; //
  const handleSave = () => {
    // 저장 로직은 여기에 추가할 수 있음
    console.log('저장된 정보:', { name, nickname, email, profileImage });
    onClose(); // 저장 후 모달 닫기
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="z-10 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">프로필 수정</h2>
        {/* 이미지 미리보기 부분 추가 */}
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Profile Preview"
            className="mb-4 w-32 h-32 rounded-full mx-auto"
          />
        ) : (
          <div className="mb-4 w-32 h-32 rounded-full bg-gray-300 mx-auto" />
        )}

        {/* 프로필 이미지 업로드 추가 */}
        <label className="block mb-2">
          프로필 이미지:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full p-2"
          />
        </label>

        <label className="mb-2 block">
          닉네임:
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </label>
        <label className="mb-2 block">
          이메일:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </label>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 rounded bg-gray-300 px-4 py-2 text-black"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
