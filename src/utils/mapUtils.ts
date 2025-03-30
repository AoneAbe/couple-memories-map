interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface PlaceDetails {
  formatted_address?: string;
  name?: string;
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
  photos?: Array<{
    height?: number;
    width?: number;
    html_attributions?: string[];
    photo_reference?: string;
  }>;
  url?: string;
  place_id?: string;
  types?: string[];
}

interface PlaceResponse {
  address: string;
  placeName: string;
  fullDetails: PlaceDetails;
}

export async function getPlaceDetails(lat: number, lng: number): Promise<PlaceResponse | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      // 最も詳細な結果を返す
      const address = data.results[0].formatted_address;
      
      // 場所の種類や名前を抽出 (可能な場合)
      const placeComponents = data.results[0].address_components;
      const placeName = placeComponents.find(
        (component: AddressComponent) => component.types.includes('point_of_interest')
      )?.long_name || '';
      
      // 必要なフィールドだけを抽出したPlaceDetailsオブジェクトを作成
      const placeDetails: PlaceDetails = {
        formatted_address: data.results[0].formatted_address,
        name: placeName,
        geometry: data.results[0].geometry,
        place_id: data.results[0].place_id,
        types: data.results[0].types
      };
      
      return {
        address,
        placeName,
        fullDetails: placeDetails
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}