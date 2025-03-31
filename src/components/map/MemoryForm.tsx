'use client';

import React, { useRef, useState } from 'react';
import { MemoryFormData, LocationWithDetails, UploadedImage } from '@/utils/types';
import Image from 'next/image';

interface MemoryFormProps {
  location: LocationWithDetails;
  onSubmit: (data: MemoryFormData) => Promise<void>;
  onCancel: () => void;
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

// 許可するファイルタイプ
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

export default function MemoryForm({ location, onSubmit, onCancel }: MemoryFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stampType, setStampType] = useState('default');
  const [isSubmitting, setIsSubmitting] = useState(false);

   // 画像アップロード関連のstate
   const [uploadedFiles, setUploadedFiles] = useState<UploadedImage[]>([]);
   const [uploadError, setUploadError] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
   
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setUploadError(null);
    
    if (!files || files.length === 0) return;
    
    // 選択されたファイルを処理
    const newFiles: UploadedImage[] = [];
    const filePromises: Promise<void>[] = [];
    
    Array.from(files).forEach(file => {
      // ファイルタイプと容量のバリデーション
      if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
        setUploadError('画像（JPG、PNG、GIF、WebP）または動画（MP4、WebM、QuickTime）のみアップロードできます');
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        setUploadError('ファイルサイズは1GB以下にしてください');
        return;
      }
      
      // ファイルをBase64に変換
      const promise = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
            newFiles.push({
              id: `temp-${Date.now()}-${newFiles.length}`,
              file,
              preview: e.target.result as string,
              type: isVideo ? 'video' : 'image',
              filename: file.name
            });
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
      
      filePromises.push(promise);
    });
    
    // すべてのファイル処理が完了したら状態を更新
    Promise.all(filePromises).then(() => {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      // 入力フィールドをリセットして複数回同じファイルを選択できるようにする
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  };
  
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData: MemoryFormData = {
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
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('思い出の保存中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">新しい思い出を記録</h2>
      
        {/* 場所の詳細情報を表示 */}
        {location.address && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <h3 className="font-medium text-blue-800">場所の情報</h3>
          {location.placeName && <p className="text-sm text-blue-700">{location.placeName}</p>}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            思い出の詳細
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    {/* 実際のプロジェクトではここに画像を表示 */}
                    {type.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs">{type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

         {/* 画像・動画アップロードセクション */}
         <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              ファイルを選択
            </button>
            <span className="ml-2 text-xs text-gray-500">
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
                  
                  <p className="text-xs truncate mt-1 text-gray-500" title={file.filename}>
                    {file.filename}
                  </p>
                </div>
              ))}
            </div>
          )}
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  );
}