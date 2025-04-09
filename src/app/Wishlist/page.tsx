import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import WishlistPlacesList from './WishlistPlacesList';
import { WishlistPlace, PlaceDetails } from '@/utils/types';

export const metadata: Metadata = {
  title: '行きたい場所一覧 | Couple Memories Map',
  description: 'カップルの行きたい場所一覧を表示',
};

export default async function WishlistPage() {
  // サーバーコンポーネントでデータを取得
  const wishlistPlacesData = await prisma.wishlistPlace.findMany({
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // 型を合わせるために明示的に変換
  const wishlistPlaces: WishlistPlace[] = wishlistPlacesData.map(place => ({
    ...place,
    // placeDetailsをPlaceDetails型に変換（または適切な型で対応）
    placeDetails: place.placeDetails as PlaceDetails | null
  }));

  return <WishlistPlacesList initialPlaces={wishlistPlaces} />;
}