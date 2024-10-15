import { supabase } from '@/app/utils/supabase';

const logoutHandler = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error);
  } else {
    console.log('Successfully logged out');
    window.location.reload();
  }
};

// 로그아웃을 호출하거나 이벤트에 연결

export { logoutHandler };
