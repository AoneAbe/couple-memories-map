import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import WishlistPlacesList from './WishlistPlacesList';

export const metadata: Metadata = {
  title: '行きたい場所一覧 | Couple Memories Map',
  description: 'カップルの行きたい場所一覧を表示',
};

export default async function WishlistPage() {
  // サーバーコンポーネントでデータを取得
  const wishlistPlaces = await prisma.wishlistPlace.findMany({
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return <WishlistPlacesList initialPlaces={wishlistPlaces} />;
}