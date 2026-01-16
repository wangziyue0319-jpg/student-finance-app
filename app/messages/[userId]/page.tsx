"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getMessages, sendMessage, markMessagesAsRead, getAllUsers } from "@/lib/social-service";
import { Message } from "@/types";

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const chatUserId = params.userId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatUser, setChatUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // 加载聊天用户信息
    const users = getAllUsers();
    const foundUser = users.find((u) => u.id === chatUserId);
    if (!foundUser) {
      router.push("/messages");
      return;
    }
    setChatUser(foundUser);

    loadMessages();

    // 标记消息为已读
    markMessagesAsRead(chatUserId, user.id);
  }, [user, chatUserId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    if (!user) return;
    const msgs = getMessages(user.id, chatUserId);
    setMessages(msgs);
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!user || !newMessage.trim()) return;

    const msg = sendMessage(user.id, chatUserId, newMessage);
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user || !chatUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                学生投资顾问
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  投资建议
                </Link>
                <Link href="/friends" className="text-gray-700 hover:text-blue-600 font-medium">
                  好友
                </Link>
                <Link href="/messages" className="text-blue-600 font-medium">
                  消息
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium">
                  个人主页
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.username}</span>
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                退出登录
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 聊天内容 */}
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回消息列表
        </Link>

        {/* 聊天头部 */}
        <div className="bg-white rounded-t-xl shadow-sm p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {chatUser.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{chatUser.username}</h2>
              <p className="text-sm text-green-600">在线</p>
            </div>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="bg-white shadow-sm p-4 min-h-[500px] max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>还没有消息，开始聊天吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isCurrentUser = message.senderId === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isCurrentUser
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? "text-blue-200" : "text-gray-500"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div className="bg-white rounded-b-xl shadow-sm p-4 border-t">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
