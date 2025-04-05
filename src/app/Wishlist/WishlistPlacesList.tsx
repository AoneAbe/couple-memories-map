'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { WishlistPlace } from '@/utils/types';

interface WishlistPlacesListProps {
  initialPlaces: WishlistPlace[];
}

export default function WishlistPlacesList({ initialPlaces }: WishlistPlacesListProps) {
  const [places, setPlaces] = useState<WishlistPlace[]>(initialPlaces);

  // 優先度に応じた星を表示するヘルパー関数
  const renderPriorityStars = (priority: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, idx) => (
          <svg 
            key={idx}
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ${idx < priority ? 'text-yellow-500' : 'text-gray-300'}`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">行きたい場所一覧</h1>
        
        {places.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-4">行きたい場所がまだ登録されていません</p>
            <Link 
              href="/map" 
              className="inline-block px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
            >
              マップから行きたい場所を追加する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div 
                key={place.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition"
              >
                <div className="p-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-6 w-6 text-pink-500" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-1">{place.title}</h2>
                      <div className="mb-2">
                        {renderPriorityStars(place.priority)}
                      </div>
                      {place.description && (
                        <p className="text-gray-700 mt-2">{place.description}</p>
                      )}
                      {place.address && (
                        <p className="text-sm text-gray-500 mt-2">{place.address}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {place.createdAt instanceof Date 
                          ? format(new Date(place.createdAt), 'yyyy年MM月dd日追加', { locale: ja })
                          : format(new Date(place.createdAt), 'yyyy年MM月dd日追加', { locale: ja })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-between">
                  <Link 
                    href={`/map?lat=${place.latitude}&lng=${place.longitude}&id=${place.id}&mode=wishlist`}
                    className="text-sm text-pink-600 hover:text-pink-800 transition"
                  >
                    地図で見る
                  </Link>
                  
                  <button
                    onClick={async () => {
                      if (confirm('この行きたい場所を削除しますか？')) {
                        try {
                          const response = await fetch(`/api/wishlist/${place.id}`, {
                            method: 'DELETE',
                          });
                          
                          if (!response.ok) {
                            throw new Error('削除に失敗しました');
                          }
                          
                          // 削除成功したら一覧から削除
                          setPlaces(places.filter(p => p.id !== place.id));
                        } catch (error) {
                          console.error('Error deleting wishlist place:', error);
                          alert('削除中にエラーが発生しました');
                        }
                      }
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}