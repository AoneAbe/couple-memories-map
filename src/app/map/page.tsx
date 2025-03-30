import MapContainer from './MapContainer';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'マップ | Couple Memories Map',
  description: '思い出の場所を地図で見る・記録する',
};

export default async function MapPage() {
  // サーバーコンポーネントでデータを取得
  const memories = await prisma.memory.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // クライアントコンポーネントにデータを渡す
  return <MapContainer initialMemories={memories} />;
}