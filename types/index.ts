// 用户信息类型
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;  // 密码字段可选，currentUser 中不保存密码
  avatar?: string;
  bio?: string;
  investmentProfile?: {
    goal?: string;
    riskTolerance?: string;
    fundLevel?: string;
    marketCondition?: string;
  };
  createdAt: string;
}

// 好友类型
export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: string;
}

// 消息类型
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// 用户会话类型
export interface UserSession {
  user: Omit<User, 'password'>;
  token: string;
}
