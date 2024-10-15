'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/utils/supabase';
import UserInfo from './UserInfo'; // UserInfo 컴포넌트 import

// 메시지 타입 정의
type Message = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // 메시지 컨테이너에 대한 참조

  useEffect(() => {
    // 기존 메시지 가져오기
    fetchMessages();

    // 실시간 메시지 업데이트 구독 설정
    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            payload.new as Message,
          ]);
        },
      )
      .subscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, []);

  // 기존 메시지 가져오기
  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    setMessages(data as Message[]);
  }

  // 새 메시지 전송
  async function sendMessage(event: React.FormEvent) {
    event.preventDefault(); // 폼 제출 시 페이지 새로고침 방지
    if (newMessage.trim() === '' || !userEmail) return; // 메시지나 사용자 이메일이 없으면 리턴

    const { error } = await supabase.from('messages').insert([
      {
        user_id: userEmail, // 로그인한 사용자의 이메일을 user_id로 사용
        content: newMessage,
      },
    ]);

    if (error) console.error(error);
    setNewMessage('');
  }

  // 메시지가 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <section className="flex flex-col h-[650px] w-[360px] mt-10 before:content-[''] before:-translate-y-10 before:h-[2px] before:w-[360px] before:bg-g-400">
      <h3 className="text-xl font-bold mb-2">실시간 채팅</h3>

      {/* UserInfo 컴포넌트 추가 */}
      <UserInfo onUserChange={setUserEmail} />

      {/* 채팅 메시지 출력 */}
      <div className="overflow-y-auto h-[500px] mb-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <div className="flex justify-between">
              <span className="font-semibold">{message.user_id}</span>
              <span>
                {new Date(message.created_at).toLocaleString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p>{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* 스크롤을 위한 참조 div */}
      </div>

      {/* 새 메시지 입력 */}
      <form
        onSubmit={sendMessage}
        className="flex items-center w-full max-w-lg"
      >
        <input
          type="text"
          placeholder={
            userEmail ? '글을 작성해주세요.' : '로그인 후 이용 가능 합니다'
          } // 로그인 여부에 따라 placeholder 변경
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!userEmail} // 로그인하지 않은 경우 입력을 비활성화
          className={`flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring focus:border-blue-300 ${!userEmail ? 'bg-gray-200' : ''}`} // 비활성화 시 배경색 변경
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
          disabled={!userEmail} // 로그인하지 않은 경우 버튼 비활성화
        >
          전송
        </button>
      </form>
    </section>
  );
}
