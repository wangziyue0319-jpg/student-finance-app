"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllUsers, getFriends, getRecentChats, getUnreadCount } from "@/lib/social-service";
import { User } from "@/types";

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentChats, setRecentChats] = useState<User[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadChats();
  }, [user, router]);

  const loadChats = () => {
    if (!user) return;

    setLoading(true);

    // 获取最近聊天的用户ID
    const chatUserIds = getRecentChats(user.id);

    // 获取所有用户和好友
    const allUsers = getAllUsers();
    const friendList = getFriends(user.id);
    const friendIds = friendList.map((f) =>
      f.userId === user.id ? f.friendId : f.userId
    );

    // 合并最近聊天和好友列表
    const relevantUserIds = Array.from(
      new Set([...chatUserIds, ...friendIds])
    );

    const chatUsers = allUsers.filter((u) => relevantUserIds.includes(u.id));

    // 计算未读消息数
    const counts: Record<string, number> = {};
    chatUsers.forEach((chatUser) => {
      const messages = JSON.parse(localStorage.getItem("messages") || "[]");
      const unread = messages.filter(
        (m: any) =>
          m.senderId === chatUser.id &&
          m.receiverId === user.id &&
          !m.read
      ).length;
      counts[chatUser.id] = unread;
    });

    setRecentChats(chatUsers);
    setUnreadCounts(counts);
    setLoading(false);
  };

  if (!user) return null;

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

      {/* 主内容 */}
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">消息</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : recentChats.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">还没有消息</h2>
            <p className="text-gray-600 mb-6">开始和你的好友聊天吧</p>
            <Link
              href="/friends"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              查找好友
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentChats.map((chatUser) => (
              <Link
                key={chatUser.id}
                href={`/messages/${chatUser.id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {chatUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {unreadCounts[chatUser.id] > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {unreadCounts[chatUser.id]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{chatUser.username}</h3>
                    <p className="text-sm text-gray-500">点击查看聊天记录</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
