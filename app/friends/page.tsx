"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAllUsers,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
} from "@/lib/social-service";
import { User } from "@/types";

export default function FriendsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "friends" | "requests">("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<Array<{ user: User; requestId: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = () => {
    if (!user) return;

    setLoading(true);

    // 加载所有用户（排除自己）
    const users = getAllUsers().filter((u) => u.id !== user.id);
    setAllUsers(users);

    // 加载好友列表
    const friendList = getFriends(user.id);
    const friendIds = friendList.map((f) =>
      f.userId === user.id ? f.friendId : f.userId
    );
    const friendsData = users.filter((u) => friendIds.includes(u.id));
    setFriends(friendsData);

    // 加载好友请求（包含请求ID）
    const requestList = getFriendRequests(user.id);
    const requestsWithId = requestList.map((r) => {
      const requestUser = users.find((u) => u.id === r.userId);
      return {
        user: requestUser!,
        requestId: r.id,
      };
    }).filter((r) => r.user);
    setRequests(requestsWithId);

    setLoading(false);
  };

  const handleSendRequest = (friendId: string) => {
    if (!user) return;
    const success = sendFriendRequest(user.id, friendId);
    if (success) {
      alert("好友请求已发送");
    } else {
      alert("发送失败或已经是好友");
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    acceptFriendRequest(requestId);
    loadData();
  };

  const handleRejectRequest = (requestId: string) => {
    if (confirm("确定要拒绝这个好友请求吗？")) {
      rejectFriendRequest(requestId);
      loadData();
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    if (!user) return;
    if (confirm("确定要删除这个好友吗？")) {
      removeFriend(user.id, friendId);
      loadData();
    }
  };

  const isFriend = (userId: string) => {
    return friends.some((f) => f.id === userId);
  };

  const hasPendingRequest = (userId: string) => {
    if (!user) return false;
    const friendList = getFriends(user.id);
    return friendList.some(
      (f) =>
        (f.userId === user.id && f.friendId === userId && f.status === "pending") ||
        (f.userId === userId && f.friendId === user.id && f.status === "pending")
    );
  };

  // 根据搜索过滤用户
  const filteredUsers = searchQuery
    ? searchUsers(searchQuery).filter((u) => u.id !== user?.id)
    : allUsers;

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
                <Link href="/friends" className="text-blue-600 font-medium">
                  好友
                </Link>
                <Link href="/messages" className="text-gray-700 hover:text-blue-600 font-medium">
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">好友管理</h1>

        {/* 标签页 */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("friends")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "friends"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                我的好友 ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "requests"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                好友请求 ({requests.length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                发现用户
              </button>
            </nav>
          </div>
        </div>

        {/* 好友列表 */}
        {activeTab === "friends" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-4">还没有好友</p>
                <button
                  onClick={() => setActiveTab("all")}
                  className="text-blue-600 hover:underline"
                >
                  去发现用户
                </button>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {friend.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{friend.username}</h3>
                      <p className="text-sm text-gray-500">{friend.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/messages/${friend.id}`}
                      className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      发消息
                    </Link>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 好友请求 */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无好友请求
              </div>
            ) : (
              requests.map(({ user: requestUser, requestId }) => (
                <div
                  key={requestUser.id}
                  className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-lg">
                        {requestUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{requestUser.username}</h3>
                      <p className="text-sm text-gray-500">{requestUser.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptRequest(requestId)}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      接受
                    </button>
                    <button
                      onClick={() => handleRejectRequest(requestId)}
                      className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 发现用户 */}
        {activeTab === "all" && (
          <div className="space-y-4">
            {/* 搜索框 */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索用户昵称..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery ? "未找到匹配的用户" : "暂无其他用户"}
              </div>
            ) : (
              filteredUsers.map((otherUser) => {
                const friend = isFriend(otherUser.id);
                const pending = hasPendingRequest(otherUser.id);

                return (
                  <div
                    key={otherUser.id}
                    className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-lg">
                          {otherUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{otherUser.username}</h3>
                        <p className="text-sm text-gray-500">{otherUser.email}</p>
                      </div>
                    </div>
                    <div>
                      {friend ? (
                        <span className="px-4 py-2 text-sm text-green-600 bg-green-50 rounded-lg">
                          已是好友
                        </span>
                      ) : pending ? (
                        <span className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">
                          已发送请求
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(otherUser.id)}
                          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          添加好友
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
