export interface CityInfo {
  name: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export const INDIAN_STATES_DATA: Record<string, CityInfo[]> = {
  'Gujarat': [
    { name: 'Surat', pincode: '395004', latitude: 21.1702, longitude: 72.8311 },
    { name: 'Ahmedabad', pincode: '380001', latitude: 23.0225, longitude: 72.5714 },
    { name: 'Vadodara', pincode: '390001', latitude: 22.3072, longitude: 73.1812 },
    { name: 'Rajkot', pincode: '360001', latitude: 22.3039, longitude: 70.8022 },
    { name: 'Bhavnagar', pincode: '364001', latitude: 21.7645, longitude: 72.1519 },
    { name: 'Jamnagar', pincode: '361001', latitude: 22.4707, longitude: 70.0577 },
    { name: 'Gandhinagar', pincode: '382010', latitude: 23.2156, longitude: 72.6369 },
    { name: 'Anand', pincode: '388001', latitude: 22.5645, longitude: 72.9289 },
    { name: 'Navsari', pincode: '396445', latitude: 20.9467, longitude: 72.9520 },
    { name: 'Vapi', pincode: '396191', latitude: 20.3712, longitude: 72.9048 },
    { name: 'Bharuch', pincode: '392001', latitude: 21.7051, longitude: 72.9959 },
    { name: 'Junagadh', pincode: '362001', latitude: 21.5222, longitude: 70.4579 },
    { name: 'Morbi', pincode: '363641', latitude: 22.8120, longitude: 70.8370 },
    { name: 'Valsad', pincode: '396001', latitude: 20.5992, longitude: 72.9342 },
    { name: 'Porbandar', pincode: '360575', latitude: 21.6417, longitude: 69.6293 },
    { name: 'Mehsana', pincode: '384001', latitude: 23.5880, longitude: 72.3693 },
  ],
  'Maharashtra': [
    { name: 'Mumbai', pincode: '400001', latitude: 18.9220, longitude: 72.8347 },
    { name: 'Pune', pincode: '411001', latitude: 18.5204, longitude: 73.8567 },
    { name: 'Nagpur', pincode: '440001', latitude: 21.1458, longitude: 79.0882 },
    { name: 'Thane', pincode: '400601', latitude: 19.2183, longitude: 72.9781 },
    { name: 'Nashik', pincode: '422001', latitude: 19.9975, longitude: 73.7898 },
    { name: 'Navi Mumbai', pincode: '400703', latitude: 19.0330, longitude: 73.0297 },
    { name: 'Chhatrapati Sambhajinagar (Aurangabad)', pincode: '431001', latitude: 19.8762, longitude: 75.3433 },
    { name: 'Solapur', pincode: '413001', latitude: 17.6599, longitude: 75.9064 },
    { name: 'Kolhapur', pincode: '416001', latitude: 16.7050, longitude: 74.2433 },
    { name: 'Amravati', pincode: '444601', latitude: 20.9374, longitude: 77.7796 },
    { name: 'Nanded', pincode: '431601', latitude: 19.1383, longitude: 77.3210 },
  ],
  'Delhi / NCR': [
    { name: 'New Delhi', pincode: '110001', latitude: 28.6139, longitude: 77.2090 },
    { name: 'Connaught Place', pincode: '110001', latitude: 28.6315, longitude: 77.2167 },
    { name: 'South Delhi (Hauz Khas / Saket)', pincode: '110016', latitude: 28.5494, longitude: 77.2001 },
    { name: 'West Delhi (Rajouri Garden)', pincode: '110027', latitude: 28.6500, longitude: 77.1200 },
    { name: 'North Delhi (Civil Lines / Model Town)', pincode: '110009', latitude: 28.7000, longitude: 77.1900 },
    { name: 'East Delhi (Laxmi Nagar)', pincode: '110092', latitude: 28.6310, longitude: 77.2770 },
    { name: 'Noida (Sector 18)', pincode: '201301', latitude: 28.5700, longitude: 77.3200 },
    { name: 'Gurugram (Cyber City / MG Road)', pincode: '122001', latitude: 28.4595, longitude: 77.0266 },
    { name: 'Faridabad', pincode: '121001', latitude: 28.4089, longitude: 77.3178 },
    { name: 'Ghaziabad', pincode: '201001', latitude: 28.6692, longitude: 77.4538 },
  ],
  'Rajasthan': [
    { name: 'Jaipur', pincode: '302001', latitude: 26.9124, longitude: 75.7873 },
    { name: 'Jodhpur', pincode: '342001', latitude: 26.2389, longitude: 73.0243 },
    { name: 'Udaipur', pincode: '313001', latitude: 24.5854, longitude: 73.7125 },
    { name: 'Kota', pincode: '324001', latitude: 25.2138, longitude: 75.8648 },
    { name: 'Bikaner', pincode: '334001', latitude: 28.0229, longitude: 73.3119 },
    { name: 'Ajmer', pincode: '305001', latitude: 26.4499, longitude: 74.6399 },
    { name: 'Bhilwara', pincode: '311001', latitude: 25.3407, longitude: 74.6313 },
    { name: 'Alwar', pincode: '301001', latitude: 27.5530, longitude: 76.6346 },
  ],
  'Karnataka': [
    { name: 'Bengaluru (Bangalore)', pincode: '560001', latitude: 12.9716, longitude: 77.5946 },
    { name: 'Mysuru (Mysore)', pincode: '570001', latitude: 12.2958, longitude: 76.6394 },
    { name: 'Hubballi-Dharwad', pincode: '580020', latitude: 15.3647, longitude: 75.1240 },
    { name: 'Mangaluru (Mangalore)', pincode: '575001', latitude: 12.9141, longitude: 74.8560 },
    { name: 'Belagavi (Belgaum)', pincode: '590001', latitude: 15.8497, longitude: 74.4977 },
    { name: 'Kalaburagi (Gulbarga)', pincode: '585101', latitude: 17.3297, longitude: 76.8343 },
  ],
  'Uttar Pradesh': [
    { name: 'Lucknow', pincode: '226001', latitude: 26.8467, longitude: 80.9462 },
    { name: 'Kanpur', pincode: '208001', latitude: 26.4499, longitude: 80.3319 },
    { name: 'Varanasi', pincode: '221001', latitude: 25.3176, longitude: 82.9739 },
    { name: 'Agra', pincode: '282001', latitude: 27.1767, longitude: 78.0081 },
    { name: 'Prayagraj (Allahabad)', pincode: '211001', latitude: 25.4358, longitude: 81.8463 },
    { name: 'Meerut', pincode: '250001', latitude: 28.9845, longitude: 77.7064 },
    { name: 'Bareilly', pincode: '243001', latitude: 28.3670, longitude: 79.4304 },
    { name: 'Aligarh', pincode: '202001', latitude: 27.8974, longitude: 78.0880 },
    { name: 'Gorakhpur', pincode: '273001', latitude: 26.7606, longitude: 83.3732 },
  ],
  'Madhya Pradesh': [
    { name: 'Indore', pincode: '452001', latitude: 22.7196, longitude: 75.8577 },
    { name: 'Bhopal', pincode: '462001', latitude: 23.2599, longitude: 77.4126 },
    { name: 'Jabalpur', pincode: '482001', latitude: 23.1815, longitude: 79.9864 },
    { name: 'Gwalior', pincode: '474001', latitude: 26.2183, longitude: 78.1828 },
    { name: 'Ujjain', pincode: '456001', latitude: 23.1765, longitude: 75.7885 },
  ],
  'Tamil Nadu': [
    { name: 'Chennai', pincode: '600001', latitude: 13.0827, longitude: 80.2707 },
    { name: 'Coimbatore', pincode: '641001', latitude: 11.0168, longitude: 76.9558 },
    { name: 'Madurai', pincode: '625001', latitude: 9.9252, longitude: 78.1198 },
    { name: 'Tiruchirappalli (Trichy)', pincode: '620001', latitude: 10.7905, longitude: 78.7047 },
    { name: 'Salem', pincode: '636001', latitude: 11.6643, longitude: 78.1460 },
  ],
  'West Bengal': [
    { name: 'Kolkata', pincode: '700001', latitude: 22.5726, longitude: 88.3639 },
    { name: 'Howrah', pincode: '711101', latitude: 22.5958, longitude: 88.2636 },
    { name: 'Siliguri', pincode: '734001', latitude: 26.7271, longitude: 88.3953 },
    { name: 'Asansol', pincode: '713301', latitude: 23.6739, longitude: 86.9524 },
    { name: 'Durgapur', pincode: '713201', latitude: 23.5204, longitude: 87.3119 },
  ],
  'Telangana': [
    { name: 'Hyderabad', pincode: '500001', latitude: 17.3850, longitude: 78.4867 },
    { name: 'Warangal', pincode: '506001', latitude: 17.9689, longitude: 79.5941 },
    { name: 'Nizamabad', pincode: '503001', latitude: 18.6725, longitude: 78.0941 },
    { name: 'Karimnagar', pincode: '505001', latitude: 18.4386, longitude: 79.1288 },
  ],
  'Andhra Pradesh': [
    { name: 'Visakhapatnam', pincode: '530001', latitude: 17.6868, longitude: 83.2185 },
    { name: 'Vijayawada', pincode: '520001', latitude: 16.5062, longitude: 80.6480 },
    { name: 'Guntur', pincode: '522001', latitude: 16.3067, longitude: 80.4365 },
    { name: 'Nellore', pincode: '524001', latitude: 14.4426, longitude: 79.9865 },
    { name: 'Tirupati', pincode: '517501', latitude: 13.6288, longitude: 79.4192 },
  ],
  'Punjab': [
    { name: 'Chandigarh', pincode: '160017', latitude: 30.7333, longitude: 76.7794 },
    { name: 'Ludhiana', pincode: '141001', latitude: 30.9010, longitude: 75.8573 },
    { name: 'Amritsar', pincode: '143001', latitude: 31.6340, longitude: 74.8723 },
    { name: 'Jalandhar', pincode: '144001', latitude: 31.3260, longitude: 75.5762 },
    { name: 'Patiala', pincode: '147001', latitude: 30.3398, longitude: 76.3869 },
  ],
  'Haryana': [
    { name: 'Gurugram', pincode: '122001', latitude: 28.4595, longitude: 77.0266 },
    { name: 'Faridabad', pincode: '121001', latitude: 28.4089, longitude: 77.3178 },
    { name: 'Panipat', pincode: '132103', latitude: 29.3909, longitude: 76.9635 },
    { name: 'Ambala', pincode: '134003', latitude: 30.3782, longitude: 76.7767 },
    { name: 'Karnal', pincode: '132001', latitude: 29.6857, longitude: 76.9905 },
    { name: 'Hisar', pincode: '125001', latitude: 29.1492, longitude: 75.7217 },
  ],
  'Kerala': [
    { name: 'Kochi (Cochin)', pincode: '682001', latitude: 9.9312, longitude: 76.2673 },
    { name: 'Thiruvananthapuram (Trivandrum)', pincode: '695001', latitude: 8.5241, longitude: 76.9366 },
    { name: 'Kozhikode (Calicut)', pincode: '673001', latitude: 11.2588, longitude: 75.7804 },
    { name: 'Thrissur', pincode: '680001', latitude: 10.5276, longitude: 76.2144 },
  ],
  'Bihar': [
    { name: 'Patna', pincode: '800001', latitude: 25.5941, longitude: 85.1376 },
    { name: 'Gaya', pincode: '823001', latitude: 24.7914, longitude: 85.0002 },
    { name: 'Muzaffarpur', pincode: '842001', latitude: 26.1209, longitude: 85.3647 },
    { name: 'Bhagalpur', pincode: '812001', latitude: 25.2425, longitude: 86.9842 },
  ],
};

export const INDIAN_STATES = Object.keys(INDIAN_STATES_DATA);

/**
 * Given a city name, searches across all states to find the best matching state
 */
export function detectStateByCity(cityName: string): string {
  if (!cityName) return 'Gujarat';
  const clean = cityName.trim().toLowerCase();
  for (const [state, cities] of Object.entries(INDIAN_STATES_DATA)) {
    if (cities.some(c => c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase()))) {
      return state;
    }
  }
  return 'Gujarat';
}

/**
 * Reverse-geocode latitude and longitude into address, city, state, and pincode
 */
export async function reverseGeocodeGPS(
  latitude: number,
  longitude: number
): Promise<{
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  formatted?: string;
}> {
  try {
    // 1. Try BigDataCloud reverse geocode client (fast, CORS-friendly, free, no API key required)
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const data = await res.json();
      const detectedCity = data.city || data.locality || data.principalSubdivision || '';
      const detectedState = data.principalSubdivision || '';
      const detectedPincode = data.postcode || '';
      const street = [data.locality, data.principalSubdivision].filter(Boolean).join(', ');

      return {
        city: detectedCity,
        state: detectedState,
        pincode: detectedPincode,
        addressLine: street || undefined,
        formatted: `${data.locality || ''}, ${detectedCity}, ${detectedState} ${detectedPincode}`.trim()
      };
    }
  } catch (err) {
    console.warn('[Reverse Geocode Notice]:', err);
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(osmUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const detectedCity = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || '';
      const detectedState = addr.state || '';
      const detectedPincode = addr.postcode || '';
      const detectedStreet = [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', ');

      return {
        city: detectedCity,
        state: detectedState,
        pincode: detectedPincode,
        addressLine: detectedStreet || data.display_name?.split(',').slice(0, 3).join(',') || undefined,
        formatted: data.display_name
      };
    }
  } catch (osmErr) {
    console.warn('[Nominatim Geocode Notice]:', osmErr);
  }

  return {};
}

/**
 * Format 24-hr time 'HH:mm' or 'HH:mm:ss' to 'hh:mm A' for display
 */
export function formatTo12Hour(timeStr?: string): string {
  if (!timeStr) return '09:00 AM';
  const clean = timeStr.trim();
  if (clean.includes('AM') || clean.includes('PM')) return clean;
  const parts = clean.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }
  return clean;
}

/**
 * Convert 12-hour 'hh:mm A' or generic string to standard 24-hour 'HH:mm' for <input type="time" />
 */
export function formatTo24HourInput(timeStr?: string): string {
  if (!timeStr) return '09:00';
  const clean = timeStr.trim();
  // Already in HH:mm format
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(clean) && !clean.includes('AM') && !clean.includes('PM')) {
    return clean.slice(0, 5);
  }
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const modifier = match[3]?.toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  return '09:00';
}
