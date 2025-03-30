// hooks/useFileUpload.ts
import { useState } from 'react';
import { UploadedImage } from '@/utils/types';

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // ファイルをFormDataに追加
      const formData = new FormData();
      formData.append('file', file);
      
      // APIにアップロード
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'アップロードに失敗しました');
      }
      
      const result = await response.json();
      
      // クライアント側のプレビュー用にURLを生成
      const fileReader = new FileReader();
      const previewPromise = new Promise<string>((resolve) => {
        fileReader.onload = () => {
          if (fileReader.result) {
            resolve(fileReader.result as string);
          }
        };
        fileReader.readAsDataURL(file);
      });
      
      const preview = await previewPromise;
      
      // アップロード結果を返す
      const uploadedFile: UploadedImage = {
        id: result.id,
        file,
        preview,
        type: result.type as 'image' | 'video',
        filename: result.filename,
        url: result.url
      };
      
      // 状態を更新
      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      return uploadedFile;
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'アップロードに失敗しました');
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const uploadMultipleFiles = async (files: File[]): Promise<UploadedImage[]> => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const uploadPromises = files.map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      
      // nullでない結果だけをフィルタリング
      return results.filter((result): result is UploadedImage => result !== null);
    } catch (error) {
      console.error('Multiple files upload error:', error);
      setUploadError(error instanceof Error ? error.message : '複数ファイルのアップロードに失敗しました');
      return [];
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };
  
  const reset = () => {
    setUploadedFiles([]);
    setUploadError(null);
  };
  
  return {
    uploadedFiles,
    isUploading,
    uploadError,
    uploadFile,
    uploadMultipleFiles,
    removeFile,
    reset
  };
}