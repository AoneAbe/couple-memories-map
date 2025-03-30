'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import MapView from '@/components/map/MapView';
import { Memory, MemoryFormData } from '@/utils/types';

interface MapContainerProps {
  initialMemories: Memory[];
}

export default function MapContainer({ initialMemories }: MapContainerProps) {
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
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
            onMemoryCreate={handleCreateMemory}
          />
        )}
      </div>
    </Layout>
  )}