export async function getPlaceDetails(lat: number, lng: number) {
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
          (component: any) => component.types.includes('point_of_interest')
        )?.long_name || '';
        
        return {
          address,
          placeName,
          fullDetails: data.results[0]
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }