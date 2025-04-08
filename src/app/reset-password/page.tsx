import { Metadata } from 'next';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'パスワード再設定 | Couple Memories Map',
  description: 'パスワードを再設定します',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Couple Memories Map</h1>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">パスワード再設定</h2>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}