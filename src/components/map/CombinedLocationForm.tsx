// /components/map/CombinedLocationForm.tsx (新規ファイル)
'use client';

import React, { useState } from 'react';
import { LocationWithDetails, MemoryFormData, WishlistPlace } from '@/utils/types';
import Image from 'next/image';

interface CombinedLocationFormProps {
  location: LocationWithDetails;
  onSubmitMemory: (data: MemoryFormData) => Promise<void>;
  onSubmitWishlist: (data: Omit<WishlistPlace, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  initialMode?: 'memory' | 'wishlist';
}

const STAMP_TYPES = [
  'default',
  'heart',
  'star',
  'smile',
  'food',
  'cafe',
  'shopping',
  'nature',
  'event'
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB

export default function CombinedLocationForm({ 
  location, 
  onSubmitMemory, 
  onSubmitWishlist, 
  onCancel,
  initialMode = 'memory'
}: CombinedLocationFormProps) {
  // 共通のフィールド
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // モード切り替え
  const [formMode, setFormMode] = useState<'memory' | 'wishlist'>(initialMode);
  
  // 思い出固有のフィールド
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stampType, setStampType] = useState('default');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // 行きたい場所固有のフィールド
  const [priority, setPriority] = useState(3); // デフォルト優先度は3
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (formMode === 'memory') {
        const memoryData: MemoryFormData = {
          title: title.trim(),
          description: description.trim() || undefined,
          latitude: location.lat,
          longitude: location.lng,
          date: date ? new Date(date) : undefined,
          stampType,
          images: uploadedFiles,
          address: location.address,
          placeName: location.placeName,
          placeDetails: location.fullDetails
        };
        
        await onSubmitMemory(memoryData);
      } else {
        const wishlistData: Omit<WishlistPlace, 'id' | 'createdAt' | 'updatedAt'> = {
          title: title.trim(),
          description: description.trim() || null,
          latitude: location.lat,
          longitude: location.lng,
          priority,
          address: location.address,
          placeName: location.placeName,
          placeDetails: location.fullDetails
        };
        
        await onSubmitWishlist(wishlistData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert(formMode === 'memory' ? '思い出の保存中にエラーが発生しました' : '行きたい場所の保存中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // ファイル関連のハンドラー（既存のMemoryFormと同じ）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 既存のコードと同じなので省略
  };
  
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900">新しい場所を記録</h2>
      
      {/* モード切り替えトグル */}
      <div className="mb-4">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            type="button"
            onClick={() => setFormMode('memory')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              formMode === 'memory' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            思い出
          </button>
          <button
            type="button"
            onClick={() => setFormMode('wishlist')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              formMode === 'wishlist' 
                ? 'bg-pink-600 text-white shadow-sm' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            行きたい場所
          </button>
        </div>
      </div>
      
      {/* 場所の詳細情報を表示 */}
      {location.address && (
        <div className={`mb-4 p-3 rounded-md ${formMode === 'memory' ? 'bg-blue-50' : 'bg-pink-50'}`}>
          <h3 className={`font-medium ${formMode === 'memory' ? 'text-blue-800' : 'text-pink-800'}`}>場所の情報</h3>
          {location.placeName && <p className={`text-sm ${formMode === 'memory' ? 'text-blue-700' : 'text-pink-700'}`}>{location.placeName}</p>}
          <p className="text-sm text-gray-800">{location.address}</p>
          <p className="text-xs text-gray-700 mt-1">
            座標: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-1">
            タイトル*
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${
              formMode === 'memory' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-pink-500 focus:border-pink-500'
            }`}
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-1">
            {formMode === 'memory' ? '思い出の詳細' : 'メモ'}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${
              formMode === 'memory' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-pink-500 focus:border-pink-500'
            }`}
          />
        </div>
        
        {/* 思い出モード固有のフィールド */}
        {formMode === 'memory' && (
          <>
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-800 mb-1">
                日付
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                スタンプの種類
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STAMP_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setStampType(type)}
                    className={`p-2 border rounded-md flex items-center justify-center ${
                      stampType === type 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mb-1 flex items-center justify-center">
                        {type.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-800">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 画像・動画アップロードセクション */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                画像・動画
              </label>
              
              <div className="mb-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov"
                  className="hidden"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  ファイルを選択
                </button>
                <span className="ml-2 text-xs text-gray-700">
                  最大1GBまで（JPG、PNG、GIF、WebP、MP4、WebM、QuickTime）
                </span>
              </div>
              
              {uploadError && (
                <p className="text-red-500 text-sm mb-2">{uploadError}</p>
              )}
              
              {/* アップロードされたファイルのプレビュー */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative border rounded-md p-1 bg-gray-50">
                      {file.type === 'image' ? (
                        <div className="aspect-square relative overflow-hidden rounded">
                          <Image
                            src={file.preview}
                            alt={file.filename}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square flex items-center justify-center bg-gray-100 rounded">
                          <video 
                            src={file.preview} 
                            className="max-h-full max-w-full" 
                            controls
                          />
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1/3 -translate-y-1/3"
                      >
                        ×
                      </button>
                      
                      <p className="text-xs truncate mt-1 text-gray-700" title={file.filename}>
                        {file.filename}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        
        {/* 行きたい場所モード固有のフィールド */}
        {formMode === 'wishlist' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              優先度
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-700">低</span>
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
              <span className="text-xs text-gray-700">高</span>
            </div>
          </div>
        )}
        
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
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              formMode === 'memory' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-pink-600 hover:bg-pink-700'
            } focus:outline-none`}
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  );
}