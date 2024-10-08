// 서버 측에서 Supabase를 설정하고 사용하기 위한 파일
// 주로 서버 환경에서 사용

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createServerSupabaseClient = () =>
  createServerComponentClient({ cookies });
