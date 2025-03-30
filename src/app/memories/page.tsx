import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import MemoriesList from './MemoriesList';

export const metadata: Metadata = {
  title: '思い出一覧 | Couple Memories Map',
  description: 'カップルの思い出一覧を表示',
};

export default async function MemoriesPage() {
  // サーバーコンポーネントでデータを取得
  const memories = await prisma.memory.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <MemoriesList initialMemories={memories} />;
}