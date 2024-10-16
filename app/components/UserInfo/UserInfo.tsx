import React, { useEffect } from 'react';
import { supabase } from '../../utils/supabase.ts';

const UserInfo: React.FC<{
  onUserChange: (
    email: string | null,
    username: string | null,
    image: string | null,
  ) => void;
}> = ({ onUserChange }) => {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchUserInfo(session.user.id);
      } else {
        onUserChange(null, null, null);
      }
    });

    async function fetchUserInfo(userId: string) {
      // users 테이블에서 username과 email 가져오기
      const { data, error } = await supabase
        .from('users') // 'users' 테이블
        .select('email, username, image') // email과 username 필드 선택
        .eq('id', userId) // 현재 로그인한 사용자 ID로 필터
        .single(); // 단일 결과만 반환

      if (error) {
        console.error('Error fetching user info:', error);
        onUserChange(null, null, null);
      } else {
        onUserChange(
          data?.email ?? null,
          data?.username ?? null,
          data?.image ?? null,
        );
      }
    }

    async function getUserInfo() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        fetchUserInfo(data.user.id); // 사용자 ID로 정보 가져오기
      }
    }
    getUserInfo();

    return () => {
      subscription?.unsubscribe();
    };
  }, [onUserChange]);

  return null;
};

export default UserInfo;
