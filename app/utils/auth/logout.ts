import { supabase } from '../supabase.ts';

export const logoutHandler = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error);
  } else {
    console.log('Successfully logged out');
    window.location.reload();
  }
};
