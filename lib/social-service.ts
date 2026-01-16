import { Friend, Message, User } from '@/types';

// 获取所有用户
export function getAllUsers(): User[] {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
}

// 搜索用户（通过用户名）
export function searchUsers(query: string): User[] {
  if (!query.trim()) return getAllUsers();
  const allUsers = getAllUsers();
  const lowerQuery = query.toLowerCase();
  return allUsers.filter((u) =>
    u.username.toLowerCase().includes(lowerQuery)
  );
}

// 获取用户好友列表
export function getFriends(userId: string): Friend[] {
  const friends = localStorage.getItem('friends');
  const allFriends: Friend[] = friends ? JSON.parse(friends) : [];
  return allFriends.filter(
    (f) => (f.userId === userId || f.friendId === userId) && f.status === 'accepted'
  );
}

// 获取好友请求
export function getFriendRequests(userId: string): Friend[] {
  const friends = localStorage.getItem('friends');
  const allFriends: Friend[] = friends ? JSON.parse(friends) : [];
  return allFriends.filter(
    (f) => f.friendId === userId && f.status === 'pending'
  );
}

// 发送好友请求
export function sendFriendRequest(userId: string, friendId: string): boolean {
  const friends = localStorage.getItem('friends');
  const allFriends: Friend[] = friends ? JSON.parse(friends) : [];

  // 检查是否已经是好友或有待处理的请求
  const existing = allFriends.find(
    (f) =>
      (f.userId === userId && f.friendId === friendId) ||
      (f.userId === friendId && f.friendId === userId)
  );

  if (existing) return false;

  const newFriend: Friend = {
    id: Date.now().toString(),
    userId,
    friendId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  allFriends.push(newFriend);
  localStorage.setItem('friends', JSON.stringify(allFriends));
  return true;
}

// 接受好友请求
export function acceptFriendRequest(friendId: string): boolean {
  const friends = localStorage.getItem('friends');
  const allFriends: Friend[] = friends ? JSON.parse(friends) : [];

  const index = allFriends.findIndex((f) => f.id === friendId);
  if (index === -1) return false;

  allFriends[index].status = 'accepted';
  localStorage.setItem('friends', JSON.stringify(allFriends));
  return true;
}

// 拒绝好友请求
export function rejectFriendRequest(friendRequestId: string): boolean {
  const friends = localStorage.getItem('friends');
  const allFriends: Friend[] = friends ? JSON.parse(friends) : [];

  const filtered = allFriends.filter((f) => f.id !== friendRequestId);
  localStorage.setItem('friends', JSON.stringify(filtered));
  return true;
}

// 删除好友
export function removeFriend(userId: string, friendId: string): boolean {
  const friends = localStorage.getItem('friends');
  const allFriends: Friend[] = friends ? JSON.parse(friends) : [];

  const filtered = allFriends.filter(
    (f) =>
      !((f.userId === userId && f.friendId === friendId) ||
        (f.userId === friendId && f.friendId === userId))
  );

  localStorage.setItem('friends', JSON.stringify(filtered));
  return true;
}

// 获取两个用户之间的消息
export function getMessages(userId1: string, userId2: string): Message[] {
  const messages = localStorage.getItem('messages');
  const allMessages: Message[] = messages ? JSON.parse(messages) : [];

  return allMessages.filter(
    (m) =>
      (m.senderId === userId1 && m.receiverId === userId2) ||
      (m.senderId === userId2 && m.receiverId === userId1)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// 发送消息
export function sendMessage(senderId: string, receiverId: string, content: string): Message {
  const messages = localStorage.getItem('messages');
  const allMessages: Message[] = messages ? JSON.parse(messages) : [];

  const newMessage: Message = {
    id: Date.now().toString(),
    senderId,
    receiverId,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  allMessages.push(newMessage);
  localStorage.setItem('messages', JSON.stringify(allMessages));

  return newMessage;
}

// 标记消息为已读
export function markMessagesAsRead(senderId: string, receiverId: string): void {
  const messages = localStorage.getItem('messages');
  const allMessages: Message[] = messages ? JSON.parse(messages) : [];

  allMessages.forEach((m) => {
    if (m.senderId === senderId && m.receiverId === receiverId) {
      m.read = true;
    }
  });

  localStorage.setItem('messages', JSON.stringify(allMessages));
}

// 获取未读消息数量
export function getUnreadCount(userId: string): number {
  const messages = localStorage.getItem('messages');
  const allMessages: Message[] = messages ? JSON.parse(messages) : [];

  return allMessages.filter((m) => m.receiverId === userId && !m.read).length;
}

// 获取最近聊天的用户
export function getRecentChats(userId: string): string[] {
  const messages = localStorage.getItem('messages');
  const allMessages: Message[] = messages ? JSON.parse(messages) : [];

  const chatPartners = new Set<string>();
  allMessages.forEach((m) => {
    if (m.senderId === userId) {
      chatPartners.add(m.receiverId);
    } else if (m.receiverId === userId) {
      chatPartners.add(m.senderId);
    }
  });

  return Array.from(chatPartners);
}
