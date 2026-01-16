"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 检查邮箱是否存在
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.some((u: any) => u.email === email);

      if (!userExists) {
        setError('该邮箱未注册');
        setIsLoading(false);
        return;
      }

      // 生成重置令牌
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiryTime = Date.now() + 30 * 60 * 1000; // 30分钟后过期

      // 存储重置令牌
      const resetTokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
      resetTokens[resetToken] = {
        email,
        expiry: expiryTime
      };
      localStorage.setItem('resetTokens', JSON.stringify(resetTokens));

      // 模拟发送邮件（实际项目中这里会调用后端API发送邮件）
      // 显示重置链接（用于演示）
      setSuccess(true);

      // 自动跳转到重置页面（模拟用户点击邮件链接）
      setTimeout(() => {
        router.push(`/reset-password?token=${resetToken}`);
      }, 3000);

    } catch (err) {
      setError('发送重置邮件失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              忘记密码
            </h1>
            <p className="text-gray-600">输入您的邮箱地址，我们将发送重置链接</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">邮件已发送！</span>
              </div>
              <p className="text-sm text-green-600">
                重置链接已发送到 <strong>{email}</strong>
              </p>
              <p className="text-xs text-green-500 mt-2">
                正在自动跳转到重置页面...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '发送中...' : '发送重置链接'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              记起密码了？{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                返回登录
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
