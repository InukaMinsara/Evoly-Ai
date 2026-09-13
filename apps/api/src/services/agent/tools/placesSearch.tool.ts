import { z } from 'zod';
import { AITool } from './tool.interface';
import { getEnv } from '../../../config/env';

export const placesSearchTool: AITool<{ query: string; location?: string; maxResults?: number }> = {
  name: 'placesSearch',
  description: 'Search for physical places like electronics stores, robotics shops, maker spaces, or hardware stores near a location.',
  parameters: z.object({
    query: z.string().describe('What to search for (e.g. "electronics store", "robotics shop")'),
    location: z.string().optional().describe('Optional location context (e.g. "Mumbai, India")'),
    maxResults: z.number().int().min(1).max(10).optional().default(5),
  }),
  execute: async ({ query, location, maxResults = 5 }) => {
    const env = getEnv();
    if (!env.GOOGLE_MAPS_API_KEY) {
      return { success: false, error: 'Google Places is not configured. Set GOOGLE_MAPS_API_KEY in .env' };
    }

    const searchText = location ? `${query} near ${location}` : query;

    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      url.searchParams.set('query', searchText);
      url.searchParams.set('key', env.GOOGLE_MAPS_API_KEY);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Places API error: ${res.statusText}`);

      const data: any = await res.json();
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API returned: ${data.status} — ${data.error_message || ''}`);
      }

      const results = (data.results || []).slice(0, maxResults).map((place: any) => ({
        name: place.name,
        address: place.formatted_address,
        placeId: place.place_id,
        rating: place.rating,
        totalRatings: place.user_ratings_total,
        location: place.geometry?.location,
        openNow: place.opening_hours?.open_now,
        types: place.types,
      }));

      return { success: true, data: results };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
