// frontend/src/features/education/services/nearbyInstitutesService.ts

import { EDUCATION_INSTITUTES, EducationInstitute } from "./nearbyInstitutesData";

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  locality?: string;
  source: 'gps' | 'manual' | 'default';
}

export interface InstituteWithDistance extends EducationInstitute {
  distanceKm: number;
  formattedDistance: string;
}

// In-memory cache for live discovered institutes around specific areas to avoid redundant fetches
const liveInstitutesCache = new Map<string, EducationInstitute[]>();

/**
 * Calculates Great-Circle Distance using the Haversine Formula
 * Returns distance in kilometers (rounded to 1 decimal place)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
}

/**
 * Format distance in user-friendly metric string (meters or kilometers)
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Generates an official Google Maps turn-by-turn navigation URL
 * from the user's current GPS location to the educational institute
 */
export function getGoogleMapsDirectionsUrl(
  institute: EducationInstitute,
  userCoords?: { latitude: number; longitude: number } | null
): string {
  const destParam = `${institute.lat},${institute.lng}`;
  const destPlace = encodeURIComponent(`${institute.name}, ${institute.address}`);

  if (userCoords && userCoords.latitude && userCoords.longitude) {
    const originParam = `${userCoords.latitude},${userCoords.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&destination_place_id=&travelmode=driving`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${destPlace}`;
}

async function safeFetch(url: string, timeoutMs = 5000): Promise<Response | null> {
  try {
    const fetchOptions: RequestInit = {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "SmartEducationAI/1.0 (https://smarteducation.ai; support@smarteducation.ai)",
      },
    };

    const isNode = typeof process !== "undefined" && Boolean(process.versions?.node);
    if (!isNode && typeof AbortController !== "undefined") {
      try {
        const controller = new AbortController();
        setTimeout(() => {
          try { controller.abort(); } catch {}
        }, timeoutMs);
        fetchOptions.signal = controller.signal;
      } catch {}
    }

    return await fetch(url, fetchOptions);
  } catch (err) {
    console.debug("safeFetch error:", err);
    return null;
  }
}

/**
 * Reverse geocodes lat/lng into a human-readable city/area name using OpenStreetMap Nominatim
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await safeFetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      4000
    );

    if (response && response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.city_district ||
        addr.town ||
        addr.village ||
        addr.city ||
        addr.county ||
        addr.state_district;
      const city = addr.city || addr.town || addr.state || "";
      const state = addr.state || "";

      if (locality && city && locality !== city) {
        return `${locality}, ${city}`;
      }
      if (city && state && city !== state) {
        return `${city}, ${state}`;
      }
      return data.display_name?.split(",").slice(0, 3).join(",") || `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    }
  } catch (err) {
    console.debug("Reverse geocode fallback to coordinates:", err);
  }

  return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
}

/**
 * Helper to convert raw Nominatim search results into EducationInstitute items
 */
function parseNominatimResult(item: any, index: number): EducationInstitute | null {
  const name = item.name || item.display_name?.split(",")?.[0]?.trim();
  if (!name || name.length < 3) return null;

  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon);
  if (isNaN(lat) || isNaN(lng)) return null;

  const addr = item.address || {};
  const city = addr.city || addr.town || addr.county || addr.state_district || "Local Area";
  const state = addr.state || "";
  const displayParts = (item.display_name || "").split(",").map((s: string) => s.trim());
  const cleanAddress = displayParts.slice(1, 4).join(", ") || `${city}, ${state}`;

  const typeStr = (item.type || item.class || "").toLowerCase();
  const nameLower = name.toLowerCase();

  let category: EducationInstitute["category"] = "college";
  let typeLabel = "College & Higher Education";

  if (typeStr.includes("school") || nameLower.includes("school")) {
    category = "school";
    typeLabel = "School & Learning Center";
  } else if (typeStr.includes("university") || nameLower.includes("university")) {
    category = "college";
    typeLabel = "University & Higher Education";
  } else if (nameLower.includes("special") || nameLower.includes("disability") || nameLower.includes("blind") || nameLower.includes("deaf") || nameLower.includes("rehab")) {
    category = "special";
    typeLabel = "Special & Inclusive Education";
  } else if (nameLower.includes("vocational") || nameLower.includes("iti") || nameLower.includes("skill") || nameLower.includes("training")) {
    category = "vocational";
    typeLabel = "Vocational & Skill Center";
  }

  return {
    id: `osm-${item.osm_id || item.place_id || index}-${lat.toFixed(3)}`,
    name: name,
    type: typeLabel,
    category: category,
    address: cleanAddress,
    city: city,
    state: state,
    lat: lat,
    lng: lng,
    courses: [
      "Degree & Diploma Programs",
      "Higher Education & Skill Development",
      "Inclusive Academic Support"
    ],
    accessibilityFeatures: [
      "Equal Opportunity Campus Access",
      "Accessible Pathways & Classrooms",
      "Digital Education Support"
    ],
    description: `Recognized educational institution located in ${city}, ${state} offering higher education and learning opportunities.`,
    rating: 4.5,
    tags: ["college", "colleges", "university", "school", "education", nameLower, city.toLowerCase()]
  };
}

/**
 * Discovers live local colleges, universities, and schools around the user's GPS coordinates using Nominatim
 */
export async function fetchLiveNearbyColleges(
  lat: number,
  lng: number,
  delta = 0.55 // ~55-60 km bounding box
): Promise<EducationInstitute[]> {
  const cacheKey = `local-${lat.toFixed(2)}-${lng.toFixed(2)}-${delta.toFixed(2)}`;
  if (liveInstitutesCache.has(cacheKey)) {
    return liveInstitutesCache.get(cacheKey)!;
  }

  try {
    const minLon = lng - delta;
    const maxLon = lng + delta;
    const minLat = lat - delta;
    const maxLat = lat + delta;
    const viewboxStr = `&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1`;

    const searchTerms = [
      "college",
      "university",
      "institute",
      "school",
      "polytechnic",
      "engineering",
      "medical"
    ];

    const fetchPromises = searchTerms.map(async (term) => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=json&limit=50&addressdetails=1${viewboxStr}`;
      const res = await safeFetch(url, 7000);
      if (res && res.ok) {
        return (await res.json()) as any[];
      }
      return [];
    });

    const results = await Promise.allSettled(fetchPromises);
    const combined: any[] = [];
    results.forEach((r) => {
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        combined.push(...r.value);
      }
    });

    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const parsedInstitutes: EducationInstitute[] = [];

    combined.forEach((item, idx) => {
      const id = item.osm_id || item.place_id;
      const rawName = (item.name || item.display_name?.split(",")?.[0] || "").trim().toLowerCase();

      if (id && seenIds.has(String(id))) return;
      if (rawName && seenNames.has(rawName)) return;

      const parsed = parseNominatimResult(item, idx);
      if (parsed) {
        if (id) seenIds.add(String(id));
        if (rawName) seenNames.add(rawName);
        parsedInstitutes.push(parsed);
      }
    });

    liveInstitutesCache.set(cacheKey, parsedInstitutes);
    return parsedInstitutes;
  } catch (err) {
    console.debug("Live nearby colleges fetch error/timeout:", err);
  }

  return [];
}

/**
 * Searches OpenStreetMap Nominatim for any educational query (e.g. "Graphic Era", "DAV College", "Hansraj", "Engineering College", etc.)
 */
export async function searchOnlineInstitutes(
  query: string,
  userCoords?: { latitude: number; longitude: number }
): Promise<EducationInstitute[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim();
  const cacheKey = `search-${cleanQuery.toLowerCase()}`;
  if (liveInstitutesCache.has(cacheKey)) {
    return liveInstitutesCache.get(cacheKey)!;
  }

  try {
    let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&limit=25&addressdetails=1&countrycodes=in`;

    // If user coords available, bias viewbox towards user's region
    if (userCoords && userCoords.latitude && userCoords.longitude) {
      const delta = 1.5; // ~150km
      const minLon = userCoords.longitude - delta;
      const maxLon = userCoords.longitude + delta;
      const minLat = userCoords.latitude - delta;
      const maxLat = userCoords.latitude + delta;
      url += `&viewbox=${minLon},${maxLat},${maxLon},${minLat}`;
    }

    const res = await safeFetch(url, 5000);

    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const parsed = data
          .map((item, idx) => parseNominatimResult(item, idx))
          .filter((i): i is EducationInstitute => i !== null);

        liveInstitutesCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.debug("Online search error:", err);
  }

  return [];
}

/**
 * Helper to match search query smartly against an institute (with synonym support)
 */
function matchesSearchQuery(inst: EducationInstitute, query: string): boolean {
  if (!query || query.trim() === "") return true;

  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);

  const searchableText = [
    inst.name,
    inst.type,
    inst.category,
    inst.address,
    inst.city,
    inst.state,
    inst.description,
    ...(inst.courses || []),
    ...(inst.accessibilityFeatures || []),
    ...(inst.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  // If user searched for "college" or "colleges", match all institutes with category "college" or type containing college/university/institute
  if (q === "college" || q === "colleges") {
    if (inst.category === "college" || searchableText.includes("college") || searchableText.includes("university")) {
      return true;
    }
  }

  if (q === "university" || q === "universities") {
    if (searchableText.includes("university") || inst.category === "college") {
      return true;
    }
  }

  if (q === "school" || q === "schools") {
    if (inst.category === "school" || searchableText.includes("school")) {
      return true;
    }
  }

  // Token matching: all tokens must be present in the searchable text
  return tokens.every((token) => {
    if (token === "college" || token === "colleges") {
      return (
        searchableText.includes("college") ||
        searchableText.includes("university") ||
        inst.category === "college"
      );
    }
    return searchableText.includes(token);
  });
}

/**
 * Returns all institutes with calculated distance from user's current coordinates,
 * sorted by nearest first, filtered by category, search text, and radius.
 */
export async function getNearbyInstitutes(
  userCoords: { latitude: number; longitude: number },
  filters?: {
    category?: string;
    searchQuery?: string;
    radiusKm?: number;
    includeLiveNearby?: boolean;
  }
): Promise<InstituteWithDistance[]> {
  let allInstitutes = [...EDUCATION_INSTITUTES];

  // 1. If live discovery is enabled, fetch real local educational institutes around user's GPS coords
  if (filters?.includeLiveNearby && userCoords.latitude && userCoords.longitude) {
    try {
      const radiusForDelta = filters?.radiusKm && filters.radiusKm > 0 ? filters.radiusKm : 50;
      const delta = Math.max((radiusForDelta / 111) * 1.15, 0.4);
      const localLive = await fetchLiveNearbyColleges(
        userCoords.latitude,
        userCoords.longitude,
        delta
      );
      if (localLive.length > 0) {
        const existingNames = new Set(allInstitutes.map((i) => i.name.toLowerCase()));
        const uniqueLocal = localLive.filter(
          (i) => !existingNames.has(i.name.toLowerCase())
        );
        allInstitutes = [...allInstitutes, ...uniqueLocal];
      }
    } catch (e) {
      console.debug("Error merging local live institutes:", e);
    }
  }

  // 2. If user entered a search query with 2+ characters, actively search online as well
  if (filters?.searchQuery && filters.searchQuery.trim().length >= 2) {
    try {
      const onlineResults = await searchOnlineInstitutes(
        filters.searchQuery,
        userCoords
      );
      if (onlineResults.length > 0) {
        const existingNames = new Set(allInstitutes.map((i) => i.name.toLowerCase()));
        const uniqueOnline = onlineResults.filter(
          (i) => !existingNames.has(i.name.toLowerCase())
        );
        allInstitutes = [...uniqueOnline, ...allInstitutes];
      }
    } catch (e) {
      console.debug("Error searching online institutes:", e);
    }
  }

  // Calculate distance for each institute
  const institutesWithDistance: InstituteWithDistance[] = allInstitutes.map((inst) => {
    const dist = calculateDistanceKm(
      userCoords.latitude,
      userCoords.longitude,
      inst.lat,
      inst.lng
    );

    return {
      ...inst,
      distanceKm: dist,
      formattedDistance: formatDistance(dist),
    };
  });

  // Filter by category
  let filtered = institutesWithDistance;
  if (filters?.category && filters.category !== "all") {
    filtered = filtered.filter((i) => i.category === filters.category);
  }

  // Filter by search query with intelligent token and synonym matching
  if (filters?.searchQuery && filters.searchQuery.trim() !== "") {
    filtered = filtered.filter((i) => matchesSearchQuery(i, filters.searchQuery!));
  }

  // Filter by max radius (if specified and greater than 0)
  // Note: If user searched for a specific name and radius produces 0 results, we don't drop results
  if (filters?.radiusKm && filters.radiusKm > 0) {
    const radiusFiltered = filtered.filter((i) => i.distanceKm <= filters.radiusKm!);
    // If radius filtering yields results, apply it; otherwise if user searched by query, keep results
    if (radiusFiltered.length > 0 || !filters.searchQuery) {
      filtered = radiusFiltered;
    }
  }

  // Sort strictly nearest first (distance ascending)
  filtered.sort((a, b) => a.distanceKm - b.distanceKm);

  return filtered;
}
