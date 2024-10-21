'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../utils/supabase.ts';
import UserInfo from '../../UserInfo/UserInfo.tsx'; // UserInfo 컴포넌트 import
import icoProfile from '../../../../public/images/ico-profile.svg'; // icoProfile 이미지 import
import Image from 'next/image';

// 메시지 타입 정의
type Message = {
  id: number;
  username: string;
  content: string;
  created_at: string;
  image?: string; // image 속성 추가
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [username, setUsername] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null); // image 상태 추가
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchMessages();

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

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, []);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });
    setMessages(data as Message[]);
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (newMessage.trim() === '' || !username) return;

    const { error } = await supabase.from('messages').insert([
      {
        username: username,
        content: newMessage,
        image: image, // image 추가
      },
    ]);

    if (error) console.error(error);
    setNewMessage('');
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <section className="mt-[57px] flex h-[50vh] w-[360px] flex-col before:absolute before:-translate-y-[32px] before:h-[1px] before:w-[360px]  before:bg-g-400 before:content-['']">
      <h3 className="mb-2 text-xl font-bold">실시간 채팅</h3>

      {/* UserInfo 컴포넌트 추가, username과 image 가져옴 */}
      <UserInfo
        onUserChange={(email, username, image) => {
          setUsername(username);
          setImage(image);
        }}
      />

      {/* 채팅 메시지 출력 */}
      <div className="mb-4  overflow-y-auto">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.id} className="mt-[24px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image
                    src={
                      message.image
                        ? `/path/to/images/${message.image}`
                        : icoProfile
                    }
                    alt={`${message.username}`}
                    width={30}
                    height={30}
                    className="mr-2 rounded-full object-cover"
                  />

                  <span className="font-semibold">{message.username}</span>
                </div>
                <span className="text-[14px] text-g-500">
                  {new Date(message.created_at).toLocaleString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="mt-2 rounded-xl bg-white px-[16px] py-[12px] text-[15px]">
                {message.content}
              </p>
            </div>
          ))
        ) : (
          <p>메시지가 없습니다.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 새 메시지 입력 */}
      <form
        onSubmit={sendMessage}
        className="flex w-full max-w-lg items-center"
      >
        <input
          type="text"
          placeholder={
            username ? '글을 작성해주세요.' : '로그인 후 이용 가능 합니다'
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!username}
          className={`grow rounded-lg bg-g-300 px-4 py-2 focus:outline-none mr-2 ${
            !username ? 'bg-gray-200' : ''
          }`}
        />
        <button
          type="submit"
          className={`rounded-lg px-4 py-2 text-white ${
            newMessage ? 'bg-g-800' : 'bg-g-600'
          }`}
          disabled={!username}
        >
          전송
        </button>
      </form>
    </section>
  );
}
