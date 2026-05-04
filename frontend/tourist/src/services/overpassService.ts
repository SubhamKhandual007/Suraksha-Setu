import axios from 'axios';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags: {
    name?: string;
    'addr:street'?: string;
    'addr:city'?: string;
    amenity?: string;
    tourism?: string;
    phone?: string;
    website?: string;
  };
}

export const overpassService = {
  fetchNearbyPlaces: async (lat: number, lon: number, radius: number = 5000) => {
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        relation["amenity"="hospital"](around:${radius},${lat},${lon});
        
        node["tourism"="hotel"](around:${radius},${lat},${lon});
        way["tourism"="hotel"](around:${radius},${lat},${lon});
        relation["tourism"="hotel"](around:${radius},${lat},${lon});
        
        node["amenity"="police"](around:${radius},${lat},${lon});
        way["amenity"="police"](around:${radius},${lat},${lon});
        relation["amenity"="police"](around:${radius},${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`);
      return response.data.elements as OverpassElement[];
    } catch (error) {
      console.error('Error fetching data from Overpass API:', error);
      return [];
    }
  },

  getDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d.toFixed(2);
  }
};
