import MapContainer from './MapContainer';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { Memory } from '@/utils/types';

export const metadata: Metadata = {
  title: 'マップ | Couple Memories Map',
  description: '思い出の場所を地図で見る・記録する',
};

export default async function MapPage() {
  // サーバーコンポーネントでデータを取得
  const dbMemories = await prisma.memory.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  // デバッグ出力
  console.log("Types of placeDetails:");
  dbMemories.forEach(memory => {
    console.log(typeof memory.placeDetails);
    console.log(memory.placeDetails);
  });

  // 型変換を行う
  const memories = dbMemories as unknown as Memory[];
  // クライアントコンポーネントにデータを渡す
  return <MapContainer initialMemories={memories} />;
}

