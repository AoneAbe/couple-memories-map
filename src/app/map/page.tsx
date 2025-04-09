import MapContainer from './MapContainer';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { Memory, WishlistPlace, PlaceDetails } from '@/utils/types';

export const metadata: Metadata = {
  title: 'マップ | Couple Memories Map',
  description: '思い出の場所を地図で見る・記録する',
};

export default async function MapPage() {
  // サーバーコンポーネントでデータを取得
  const memoriesData = await prisma.memory.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // メモリーデータを変換
  const memories: Memory[] = memoriesData.map(memory => ({
    ...memory,
    placeDetails: memory.placeDetails as PlaceDetails | null
  }));

  // 行きたい場所のデータも取得
  const wishlistPlacesData = await prisma.wishlistPlace.findMany({
    orderBy: { priority: 'desc' },
  });

  // 行きたい場所データを変換
  const wishlistPlaces: WishlistPlace[] = wishlistPlacesData.map(place => ({
    ...place,
    placeDetails: place.placeDetails as PlaceDetails | null
  }));

  // クライアントコンポーネントにデータを渡す
  return <MapContainer 
    initialMemories={memories} 
    initialWishlistPlaces={wishlistPlaces} 
  />;
}