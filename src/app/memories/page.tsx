import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import MemoriesList from './MemoriesList';
import { Memory, UploadedImage } from '@/utils/types';

export const metadata: Metadata = {
  title: '思い出一覧 | Couple Memories Map',
  description: 'カップルの思い出一覧を表示',
};

export default async function MemoriesPage() {
  // サーバーコンポーネントでデータを取得
  const dbMemories = await prisma.memory.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      memoryImages: true, // 関連する画像を取得
    },
  });

  // Prismaの結果をMemory型に変換
  const memories: Memory[] = dbMemories.map(memory => {
    // memoryImagesをUploadedImage[]に変換
    const images: UploadedImage[] = (memory.memoryImages || []).map(img => ({
      id: img.id,
      filename: img.filename,
      preview: img.url,
      type: (img.type as 'image' | 'video') || 'image',
      url: img.url,
      // クライアント側専用のプロパティにはダミー値を設定
      file: new File([], img.filename, {
        type: img.type === 'video' ? 'video/mp4' : 'image/jpeg'
      })
    }));

    return {
      ...memory,
      images: images,
    };
  });

  return <MemoriesList initialMemories={memories} />;
}