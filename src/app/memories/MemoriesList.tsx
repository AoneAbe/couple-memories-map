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
  const [memories, setMemories] = useState<Memory[]>(initialMemories);

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
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-1 text-gray-900">{memory.title}</h2>
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

                  <div className="flex space-x-3">
                    <Link
                      href={`/memories/edit/${memory.id}`}
                      className="text-sm text-gray-600 hover:text-gray-800 transition flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      編集
                    </Link>
                    
                    <button
                      onClick={async () => {
                        if (confirm('この思い出を削除しますか？')) {
                          try {
                            const response = await fetch(`/api/memories/${memory.id}`, {
                              method: 'DELETE',
                            });
                            
                            if (!response.ok) {
                              throw new Error('削除に失敗しました');
                            }
                            
                            // 削除成功したら一覧から削除
                            setMemories(memories.filter(m => m.id !== memory.id));
                          } catch (error) {
                            console.error('Error deleting memory:', error);
                            alert('削除中にエラーが発生しました');
                          }
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-800 transition flex items-center cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}