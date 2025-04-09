import { Prisma } from '@prisma/client';

// Prismaが生成するJSONの型を利用
export type JsonValue = Prisma.JsonValue;
export type JsonObject = Prisma.JsonObject;

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
  placeDetails?: PlaceDetails | JsonValue | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  // 関連するメモリー画像
  memoryImages?: MemoryImage[];
  images?: UploadedImage[];
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
  placeDetails?: PlaceDetails | JsonValue | null;
  priority: number;
  isVisited: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface PlaceDetails {
  // 基本情報
  formatted_address?: string;
  name?: string;
  
  // 連絡先情報
  formatted_phone_number?: string;
  
  // 位置情報
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
    viewport?: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  
  // メディア情報
  photos?: Array<{
    height?: number;
    width?: number;
    html_attributions?: string[];
    photo_reference?: string;
  }>;
  
  // リンク情報
  url?: string;
  
  // その他の情報があれば追加可能
  place_id?: string;
  types?: string[];
}
  
// Typescript用の型定義
export interface MemoryFormData {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  date?: Date;
  stampType: string;
  images?: UploadedImage[];
  address?: string;
  placeName?: string;
  placeDetails?: PlaceDetails | JsonValue | null;
}

export interface LocationWithDetails extends google.maps.LatLngLiteral {
  lat: number;
  lng: number;
  address?: string;
  placeName?: string;
  fullDetails?: PlaceDetails | JsonValue | null;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  filename: string;
  url?: string;
}

export interface WishlistPlace {
  id: string;
  title: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  priority: number; // 優先度（1-5等）
  address?: string | null;
  placeName?: string | null;
  placeDetails?: PlaceDetails | null;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
}

export type FormMode = 'memory' | 'wishlist';
// LocationModeを追加して、マップの表示モードを管理
export type LocationMode = 'normal' | 'memories';