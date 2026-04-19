export interface RegionalCity {
  name: string;
  lat: number;
  lon: number;
}

export const STATE_CITIES: Record<string, RegionalCity[]> = {
  "Jammu and Kashmir": [
    { name: "Srinagar", lat: 34.0837, lon: 74.7973 },
    { name: "Jammu", lat: 32.7186, lon: 74.8581 },
    { name: "Gulmarg", lat: 34.0484, lon: 74.3805 },
    { name: "Leh", lat: 34.1526, lon: 77.5771 },
    { name: "Pahalgam", lat: 34.0161, lon: 75.3150 },
    { name: "Badgam", lat: 34.0154721, lon: 74.7220085 },
  ],
  "Delhi": [
    { name: "New Delhi", lat: 28.6139, lon: 77.2090 },
    { name: "Noida", lat: 28.5355, lon: 77.3910 },
    { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
    { name: "Ghaziabad", lat: 28.6692, lon: 77.4538 },
    { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
    { name: "Dwarka", lat: 28.5823, lon: 77.0500 },
  ],
  "Himachal Pradesh": [
    { name: "Shimla", lat: 31.1048, lon: 77.1734 },
    { name: "Manali", lat: 32.2432, lon: 77.1892 },
    { name: "Dharamshala", lat: 32.2190, lon: 76.3234 },
    { name: "Solan", lat: 30.9045, lon: 77.0967 },
    { name: "Kullu", lat: 31.9579, lon: 77.1095 },
    { name: "Mandi", lat: 31.5892, lon: 76.9182 },
  ],
  "Punjab": [
    { name: "Amritsar", lat: 31.6340, lon: 74.8723 },
    { name: "Ludhiana", lat: 30.9010, lon: 75.8573 },
    { name: "Jalandhar", lat: 31.3260, lon: 75.5762 },
    { name: "Patiala", lat: 30.3398, lon: 76.3869 },
    { name: "Bathinda", lat: 30.2110, lon: 74.9455 },
    { name: "Mohali", lat: 30.7046, lon: 76.7179 },
  ],
  "Haryana": [
    { name: "Gurugram", lat: 28.4595, lon: 77.0266 },
    { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
    { name: "Panchkula", lat: 30.6942, lon: 76.8606 },
    { name: "Ambala", lat: 30.3782, lon: 76.7767 },
    { name: "Panipat", lat: 29.3909, lon: 76.9635 },
    { name: "Rohtak", lat: 28.8955, lon: 76.6066 },
  ],
  "Ladakh": [
    { name: "Leh", lat: 34.1526, lon: 77.5771 },
    { name: "Kargil", lat: 34.5539, lon: 76.1349 },
    { name: "Diskit", lat: 34.5428, lon: 77.5617 },
    { name: "Padum", lat: 33.4682, lon: 76.8837 },
    { name: "Hunder", lat: 34.5833, lon: 77.4333 },
    { name: "Pangong", lat: 33.7547, lon: 78.6675 },
  ]
};

export const DEFAULT_STATE = "Jammu and Kashmir";
