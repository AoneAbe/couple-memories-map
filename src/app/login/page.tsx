import { Metadata } from 'next';
import LoginForm from './LoginForm';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'ログイン | Couple Memories Map',
  description: 'アカウントにログインして思い出を共有しましょう',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="bg-white py-8 px-6 shadow rounded-lg text-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}