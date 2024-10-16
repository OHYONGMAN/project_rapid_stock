import React, { useEffect } from 'react';
import { supabase } from '../../../utils/supabase.ts';

const UserInfo: React.FC<{ onUserChange: (email: string | null) => void }> = ({
  onUserChange,
}) => {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      onUserChange(session?.user?.email ?? null);
    });

    async function getUserInfo() {
      const { data, error } = await supabase.auth.getUser();

      if (data.user) {
        onUserChange(data.user.email ?? null);
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
