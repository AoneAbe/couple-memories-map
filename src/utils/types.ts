// DB－Tableの型定義
export interface Memory {
  id: string;
  title: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  date: Date;
  stampType: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
  user?: User | null;
  address?: string | null;
  placeName?: string | null;
  placeDetails?: Record<string, unknown>;
  createdBy?: string | null;
  updatedBy?: string | null;
  // 関連するメモリー画像
  memoryImages?: MemoryImage[];
}

export interface MemoryImage {
  id: string;
  url: string;
  filename: string;
  type: string; // 'image' または 'video'
  createdAt: Date;
  memoryId: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  memories?: Memory[];
  wishlist?: Wishlist[];
}

export interface Wishlist {
  id: string;
  title: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  placeName?: string | null;
  placeDetails?: any;
  priority: number;
  isVisited: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}
  
// Typescript用の型定義
export interface MemoryFormData {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  date?: Date;
  stampType: string;
  uploadedImages?: UploadedImage[];
  address?: string;
  placeName?: string;
  placeDetails?: any;
}

export interface LocationWithDetails extends google.maps.LatLngLiteral {
  lat: number;
  lng: number;
  address?: string;
  placeName?: string;
  fullDetails?: any;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  filename: string;
  url?: string;
}