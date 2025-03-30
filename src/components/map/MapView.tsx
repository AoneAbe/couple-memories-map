'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Memory, MemoryFormData, LocationWithDetails } from '@/utils/types';
import MemoryForm from './MemoryForm';
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
  onMemoryCreate: (memoryData: MemoryFormData) => Promise<Memory>;
}

export default function MapView({ apiKey, memories, onMemoryCreate }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  const [_map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDetails | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'normal' | 'memories'>('normal');

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
      
      // 場所の詳細情報を取得
      const placeDetails = await getPlaceDetails(clickedLocation.lat, clickedLocation.lng);

      setSelectedLocation({
        ...clickedLocation,
        address: placeDetails?.address || '',
        placeName: placeDetails?.placeName || '',
        fullDetails: placeDetails?.fullDetails || null
      });
      setSelectedMemory(null);
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
  };

  const handleFormSubmit = async (data: MemoryFormData) => {
    try {
      const _newMemory = await onMemoryCreate(data);
      setIsFormOpen(false);
      setSelectedLocation(null);

      // 思い出モードに自動的に切り替え
      setDisplayMode('memories');

    } catch (error) {
      console.error('Failed to create memory:', error);
    }
  };

  return isLoaded ? (
    <div className="relative w-full h-full">

      {/* 表示モード切替ボタン */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={() => setDisplayMode(displayMode === 'normal' ? 'memories' : 'normal')}
          className="px-4 py-2 bg-white rounded-md shadow-md text-sm font-medium transition hover:bg-gray-50"
        >
          {displayMode === 'normal' ? '思い出モードに切替' : '通常モードに切替'}
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={10}
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
        {/* 思い出モードの場合のみマーカーを表示 */}
        {displayMode === 'memories' && memories.length > 0 ? (
          <>
            {console.log('マーカー表示対象メモリ:', memories)}
            {memories.map((memory) => (
              <Marker
                key={memory.id}
                position={{ 
                  lat: typeof memory.latitude === 'string' ? parseFloat(memory.latitude) : memory.latitude, 
                  lng: typeof memory.longitude === 'string' ? parseFloat(memory.longitude) : memory.longitude 
                }}
                onClick={() => handleMarkerClick(memory)}
                // icon={{
                //   url: `/images/stamps/${memory.stampType || 'default'}.svg`,
                //   scaledSize: new window.google.maps.Size(40, 40)
                // }}
              />
            ))}
          </>
        ) : displayMode === 'memories' ? (
          <>{console.log('思い出モードですが、メモリが存在しません')}</>
        ) : (
          <>{console.log('通常モード - マーカー非表示')}</>
        )}

        {/* 選択した思い出の情報ウィンドウ */}
        {selectedMemory && (
          <InfoWindow
            position={{ lat: selectedMemory.latitude, lng: selectedMemory.longitude }}
            onCloseClick={() => setSelectedMemory(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-bold text-lg">{selectedMemory.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(selectedMemory.date).toLocaleDateString('ja-JP')}
              </p>
              {selectedMemory.description && (
                <p className="mt-2 text-sm">{selectedMemory.description}</p>
              )}
              {selectedMemory.address && (
                <p className="mt-2 text-sm text-gray-600">{selectedMemory.address}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* 新しい思い出フォーム */}
      {isFormOpen && selectedLocation && (
        <div className="absolute right-4 top-4 w-96 bg-white rounded-lg shadow-lg">
          <MemoryForm
            location={selectedLocation}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
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