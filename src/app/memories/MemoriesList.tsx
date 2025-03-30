'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Memory } from '@/utils/types';

interface MemoriesListProps {
  initialMemories: Memory[];
}

export default function MemoriesList({ initialMemories }: MemoriesListProps) {
  const [memories] = useState<Memory[]>(initialMemories);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">思い出一覧</h1>
        
        {memories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-4">思い出がまだ登録されていません</p>
            <Link 
              href="/map" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              マップから思い出を追加する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <div 
                key={memory.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition"
              >
                <div className="p-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {/* 実際のプロジェクトではここにスタンプ画像を表示 */}
                        {memory.stampType.slice(0, 1).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-1">{memory.title}</h2>
                      <p className="text-sm text-gray-500 mb-2">
                        {memory.date instanceof Date 
                          ? format(new Date(memory.date), 'yyyy年MM月dd日', { locale: ja })
                          : format(new Date(memory.date), 'yyyy年MM月dd日', { locale: ja })}
                      </p>
                      {memory.description && (
                        <p className="text-gray-700 mt-2">{memory.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                  <Link 
                    href={`/map?lat=${memory.latitude}&lng=${memory.longitude}&id=${memory.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 transition"
                  >
                    地図で見る &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}