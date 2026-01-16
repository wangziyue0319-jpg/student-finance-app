"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setBio(user.bio || "");
    }
  }, [user, router]);

  const handleSaveBio = () => {
    updateUser({ bio });
    setIsEditing(false);
    setSaveMessage("个人简介已更新");
    setTimeout(() => setSaveMessage(""), 3000);
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
                <Link href="/messages" className="text-gray-700 hover:text-blue-600 font-medium">
                  消息
                </Link>
                <Link href="/profile" className="text-blue-600 font-medium">
                  个人主页
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.username}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">个人主页</h1>

        {/* 个人信息卡片 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {/* 封面 */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600" />

          {/* 头像和基本信息 */}
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.username}</h2>
            <p className="text-gray-500 mb-4">{user.email}</p>

            {saveMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg">
                {saveMessage}
              </div>
            )}

            {/* 个人简介 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">个人简介</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    编辑
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="介绍一下自己..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveBio}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setBio(user.bio || "");
                      }}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  {bio || "还没有添加个人简介"}
                </p>
              )}
            </div>

            {/* 账户信息 */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">账户信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">用户ID</span>
                  <p className="text-gray-800 font-mono">{user.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">注册时间</span>
                  <p className="text-gray-800">
                    {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 投资偏好 */}
        {user.investmentProfile && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">投资偏好</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-gray-600">投资目标：</span>
                <span className="text-gray-800 font-medium">
                  {user.investmentProfile.goal}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-gray-600">风险偏好：</span>
                <span className="text-gray-800 font-medium">
                  {user.investmentProfile.riskTolerance}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-gray-600">资金规模：</span>
                <span className="text-gray-800 font-medium">
                  {user.investmentProfile.fundLevel}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 快速操作 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800">获取投资建议</div>
                <div className="text-sm text-gray-500">评估你的投资组合</div>
              </div>
            </Link>

            <Link
              href="/friends"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800">管理好友</div>
                <div className="text-sm text-gray-500">添加和管理你的好友</div>
              </div>
            </Link>

            <Link
              href="/messages"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-800">查看消息</div>
                <div className="text-sm text-gray-500">与好友聊天交流</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
