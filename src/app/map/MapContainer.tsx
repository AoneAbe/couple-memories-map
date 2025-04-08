'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import MapView from '@/components/map/MapView';
import { Memory, MemoryFormData, WishlistPlace } from '@/utils/types';

interface MapContainerProps {
  initialMemories: Memory[];
  initialWishlistPlaces: WishlistPlace[];
}

export default function MapContainer({ initialMemories, initialWishlistPlaces }: MapContainerProps) {
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [wishlistPlaces, setWishlistPlaces] = useState<WishlistPlace[]>(initialWishlistPlaces); // 追加
  const [error, setError] = useState<string | null>(null);

  const handleCreateMemory = async (memoryData: MemoryFormData) => {
    try {
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '思い出の作成に失敗しました');
      }

      const createdMemory = await response.json();
      
      // 新しい思い出を追加
      setMemories((prevMemories) => [createdMemory, ...prevMemories]);
      
      return createdMemory;
    } catch (err) {
      console.error('Error creating memory:', err);
      setError(err instanceof Error ? err.message : '思い出の作成中にエラーが発生しました');
      throw err;
    }
  };
  
  // 行きたい場所の作成ハンドラを追加
  const handleCreateWishlist = async (wishlistData: Omit<WishlistPlace, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wishlistData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '行きたい場所の作成に失敗しました');
      }

      const createdWishlist = await response.json();
      
      // 新しい行きたい場所を追加
      setWishlistPlaces((prevPlaces) => [createdWishlist, ...prevPlaces]);
      
      return createdWishlist;
    } catch (err) {
      console.error('Error creating wishlist place:', err);
      setError(err instanceof Error ? err.message : '行きたい場所の作成中にエラーが発生しました');
      throw err;
    }
  };

  // 思い出の更新ハンドラ
  const handleUpdateMemories = (updatedMemories: Memory[]) => {
    setMemories(updatedMemories);
  };

  // 思い出の削除ハンドラ
  const handleDeleteMemory = (memoryId: string) => {
    setMemories((prevMemories) => prevMemories.filter(memory => memory.id !== memoryId));
  };
  
  return (
    <Layout>
      <div className="h-screen w-full">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <MapView
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
            memories={memories}
            wishlistPlaces={wishlistPlaces}
            onMemoryCreate={handleCreateMemory}
            onWishlistCreate={handleCreateWishlist}
            onMemoryDelete={handleDeleteMemory}
            onMemoryUpdate={handleUpdateMemories}
          />
        )}
      </div>
    </Layout>
  );
}