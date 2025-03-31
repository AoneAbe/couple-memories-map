import MapContainer from './MapContainer';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { Memory, UploadedImage } from '@/utils/types';

export const metadata: Metadata = {
  title: 'マップ | Couple Memories Map',
  description: '思い出の場所を地図で見る・記録する',
};

export default async function MapPage() {
  // サーバーコンポーネントでデータを取得
  const dbMemories = await prisma.memory.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      memoryImages: true, // 関連する画像を取得
    },
  });
  
  // Prismaの結果をMemory型に変換し、memoryImagesをimagesとして整形
  const memories: Memory[] = dbMemories.map(memory => {
    // memoryImagesをMemoryが期待するUploadedImage[]に変換
    const images: UploadedImage[] = (memory.memoryImages || []).map(img => ({
      id: img.id,
      filename: img.filename,
      preview: img.url, // URLをプレビューとして使用
      type: (img.type as 'image' | 'video') || 'image',
      url: img.url,
      // クライアント側専用のプロパティにはダミー値を設定
      file: new File([], img.filename, { 
        type: img.type === 'video' ? 'video/mp4' : 'image/jpeg' 
      })
    }));

    return {
      ...memory,
      // 型定義にあるimagesプロパティにmemoryImagesから変換したデータを設定
      images: images,
      // その他のプロパティはそのまま
    };
  });

  // クライアントコンポーネントにデータを渡す
  return <MapContainer initialMemories={memories} />;
}