'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Memory, MemoryFormData, PlaceDetails, LocationWithDetails, WishlistPlace, FormMode, LocationMode } from '@/utils/types';
import MemoryForm from './MemoryForm';
import WishlistForm from './WishlistForm';
import CombinedLocationForm from './CombinedLocationForm';
import { getPlaceDetails } from '@/utils/mapUtils';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// 東京の座標をデフォルトとして設定
const defaultCenter = {
  lat: 34.680688,
  lng: 133.731180
};

interface MapViewProps {
  apiKey: string;
  memories: Memory[];
  wishlistPlaces: WishlistPlace[];
  onMemoryCreate: (memoryData: MemoryFormData) => Promise<Memory>;
  onWishlistCreate: (wishlistData: Omit<WishlistPlace, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WishlistPlace>;
  onMemoryDelete?: (memoryId: string) => void;
  onMemoryUpdate?: (updatedMemory: Memory[]) => void;
}

export default function MapView({ apiKey, memories, wishlistPlaces, onMemoryCreate, onWishlistCreate }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDetails | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [selectedWishlist, setSelectedWishlist] = useState<WishlistPlace | null>(null); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  // const [formType, setFormType] = useState<FormMode>('memory');
  const [displayMode, setDisplayMode] = useState<LocationMode>('normal');
  const [tempMarker, setTempMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const [showMemories, setShowMemories] = useState(true);
  const [showWishlist, setShowWishlist] = useState(true);

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    mapRef.current = null;
    setMap(null);
  }, []);

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const clickedLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      
      setTempMarker(clickedLocation);

      // 場所の詳細情報を取得
      const placeDetails = await getPlaceDetails(clickedLocation.lat, clickedLocation.lng);

      setSelectedLocation({
        ...clickedLocation,
        address: placeDetails?.address || '',
        placeName: placeDetails?.placeName || '',
        fullDetails: placeDetails?.fullDetails as unknown as PlaceDetails || null
      });
      setSelectedMemory(null);
      setSelectedWishlist(null);
      setIsFormOpen(true);
    }
  };

  const handleMarkerClick = (memory: Memory) => {
    setSelectedMemory(memory);
    setSelectedLocation(null);
    setIsFormOpen(false);

    // メモリの位置に地図を移動
    if (mapRef.current) {
      mapRef.current.panTo({ lat: memory.latitude, lng: memory.longitude });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedLocation(null);
    setTempMarker(null);
  };

  const handleFormSubmit = async (data: MemoryFormData) => {
    try {
      await onMemoryCreate(data);
      setIsFormOpen(false);
      setSelectedLocation(null);
      setTempMarker(null);

      // 思い出モードに自動的に切り替え
      setDisplayMode('memories');

    } catch (error) {
      console.error('Failed to create memory:', error);
    }
  };

  // wishlistマーカーのクリックハンドラを追加
  const handleWishlistMarkerClick = (wishlist: WishlistPlace) => {
    setSelectedWishlist(wishlist);
    setSelectedLocation(null);
    setSelectedMemory(null);
    setIsFormOpen(false);

    if (mapRef.current) {
      mapRef.current.panTo({ lat: wishlist.latitude, lng: wishlist.longitude });
    }
  };

  // フォーム提出ハンドラ（wishlist用）
  const handleWishlistFormSubmit = async (data: Omit<WishlistPlace, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await onWishlistCreate(data);
      setIsFormOpen(false);
      setSelectedLocation(null);
            
    } catch (error) {
      console.error('Failed to create wishlist place:', error);
    }
  };

  return isLoaded ? (
    <div className="relative w-full h-full">

      {/* 表示モード切替ボタン */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <button 
          onClick={() => setDisplayMode('normal')}
          className={`px-3 py-1.5 rounded-md shadow-md text-xs sm:text-sm font-medium transition ${
            displayMode === 'normal' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          GooglMap
        </button>
        <button 
          onClick={() => setDisplayMode('memories')}
          className={`px-3 py-1.5 rounded-md shadow-md text-xs sm:text-sm font-medium transition ${
            displayMode === 'memories' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Memories
        </button>
      </div>

      {/* 現在地ボタンを追加 */}
      <div className="absolute bottom-10 right-4 z-10">
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  };
                  if (mapRef.current) {
                    mapRef.current.panTo(pos);
                    mapRef.current.setZoom(15);
                  }
                },
                () => {
                  console.error('Error: The Geolocation service failed.');
                }
              );
            } else {
              console.error('Error: Your browser doesn\'t support geolocation.');
            }
          }}
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
          // 標準のPOIアイコンなどを非表示にするスタイル
          styles: displayMode === 'memories' ? [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            },
            // {
            //   featureType: "transit",
            //   elementType: "labels",
            //   stylers: [{ visibility: "off" }]
            // },
            // {
            //   featureType: "business",
            //   stylers: [{ visibility: "off" }]
            // }
          ] : []
        }}
      >
         {/* 思い出モードの場合のマーカー */}
         {displayMode === 'memories' && (
          <div className="absolute top-16 left-4 z-10 bg-white rounded-md shadow-md p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">表示フィルター</div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showMemories} 
                  onChange={(e) => setShowMemories(e.target.checked)} 
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-800 flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-blue-600 mr-1" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  思い出
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showWishlist} 
                  onChange={(e) => setShowWishlist(e.target.checked)} 
                  className="h-4 w-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-800 flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-pink-600 mr-1" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  行きたい場所
                </span>
              </label>
            </div>
          </div>
        )}

        {/* 思い出モードの場合のマーカー */}
        {displayMode === 'memories' && showMemories && memories.length > 0 && (
          <>
            {memories.map((memory) => (
              <Marker
                key={memory.id}
                position={{ 
                  lat: typeof memory.latitude === 'string' ? parseFloat(memory.latitude) : memory.latitude, 
                  lng: typeof memory.longitude === 'string' ? parseFloat(memory.longitude) : memory.longitude 
                }}
                onClick={() => handleMarkerClick(memory)}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#4A89F3" stroke="#FFF" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32),
                  anchor: new google.maps.Point(16, 32)
                }}
              />
            ))}
          </>
        )}

        {/* 行きたい場所のマーカー（思い出モードで表示） */}
        {displayMode === 'memories' && showWishlist && wishlistPlaces.length > 0 && (
          <>
            {wishlistPlaces.map((place) => (
              <Marker
                key={place.id}
                position={{ 
                  lat: typeof place.latitude === 'string' ? parseFloat(place.latitude) : place.latitude, 
                  lng: typeof place.longitude === 'string' ? parseFloat(place.longitude) : place.longitude 
                }}
                onClick={() => handleWishlistMarkerClick(place)}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#FF6B6B" stroke="#FFF" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32)
                }}
              />
            ))}
          </>
        )}

        {/* 追加: タップ位置の一時マーカー */}
        {tempMarker && (
          <Marker
            position={tempMarker}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4A89F3" stroke-width="2">
                  <circle cx="12" cy="12" r="10" fill="rgba(74, 137, 243, 0.3)" />
                  <circle cx="12" cy="12" r="3" fill="#4A89F3" />
                </svg>
              `),
              anchor: new google.maps.Point(20, 20),
              scaledSize: new google.maps.Size(40, 40)
            }}
          />
        )}

        {/* 選択した思い出の情報ウィンドウ */}
        {selectedMemory && (
          <InfoWindow
            position={{ lat: selectedMemory.latitude, lng: selectedMemory.longitude }}
            onCloseClick={() => setSelectedMemory(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-lg text-gray-900">{selectedMemory.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(selectedMemory.date).toLocaleDateString('ja-JP')}
              </p>
              {selectedMemory.description && (
                <p className="mt-2 text-sm text-gray-900">{selectedMemory.description}</p>
              )}
              {selectedMemory.address && (
                <p className="mt-2 text-sm text-gray-600">{selectedMemory.address}</p>
              )}
            </div>
          </InfoWindow>
        )}

        {/* 選択した行きたい場所の情報ウィンドウ */}
        {selectedWishlist && (
          <InfoWindow
            position={{ lat: selectedWishlist.latitude, lng: selectedWishlist.longitude }}
            onCloseClick={() => setSelectedWishlist(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-lg">{selectedWishlist.title}</h3>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-600 mr-2">優先度:</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg 
                      key={idx}
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ${idx < selectedWishlist.priority ? 'text-yellow-500' : 'text-gray-300'}`}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              {selectedWishlist.description && (
                <p className="mt-2 text-sm">{selectedWishlist.description}</p>
              )}
              {selectedWishlist.address && (
                <p className="mt-2 text-sm text-gray-600">{selectedWishlist.address}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* 新しい思い出フォーム・行きたい場所フォーム */}
      {isFormOpen && selectedLocation && (
         <div className="absolute right-4 top-4 w-full sm:w-96 max-w-[calc(100%-2rem)] bg-white rounded-lg shadow-lg">
         <CombinedLocationForm
           location={selectedLocation}
           onSubmitMemory={handleFormSubmit}
           onSubmitWishlist={handleWishlistFormSubmit}
           onCancel={handleFormClose}
           initialMode='memory' // 現在の表示モードに応じた初期モードを設定
         />
       </div>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <p>地図を読み込み中...</p>
    </div>
  );
}