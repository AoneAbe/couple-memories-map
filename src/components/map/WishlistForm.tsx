'use client';

import React, { useState } from 'react';
import { LocationWithDetails, PlaceDetails, WishlistPlace } from '@/utils/types';

interface WishlistFormProps {
  location: LocationWithDetails;
  onSubmit: (data: Omit<WishlistPlace, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export default function WishlistForm({ location, onSubmit, onCancel }: WishlistFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(3); // デフォルト優先度は3
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData: Omit<WishlistPlace, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        description: description.trim() || null,
        latitude: location.lat,
        longitude: location.lng,
        priority,
        address: location.address,
        placeName: location.placeName,
        // 明示的な型キャストを追加
        placeDetails: location.fullDetails as PlaceDetails | null
      };
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('行きたい場所の保存中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">行きたい場所を登録</h2>
      
      {/* 場所の詳細情報を表示 */}
      {location.address && (
        <div className="mb-4 p-3 bg-pink-50 rounded-md">
          <h3 className="font-medium text-pink-800">場所の情報</h3>
          {location.placeName && <p className="text-sm text-pink-700">{location.placeName}</p>}
          <p className="text-sm text-gray-600">{location.address}</p>
          <p className="text-xs text-gray-500 mt-1">
            座標: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル*
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            メモ
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            優先度
          </label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">低</span>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={`w-8 h-8 rounded-full focus:outline-none ${
                    priority === value 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500">高</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  );
}