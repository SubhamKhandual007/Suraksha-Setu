export interface SafetyZone {
  id: string | number;
  name: string;
  type: 'safe' | 'danger' | 'caution';
  lat: number;
  lng: number;
  radius: number;
  reason?: string;
}

const STORAGE_KEY = 'safety_zones_log';

const defaultZones: SafetyZone[] = [
  { id: 1, name: 'Nandankanan Tourist Zone', type: 'safe', lat: 20.3956, lng: 85.8161, radius: 2500 },
  { id: 2, name: 'Khandagiri Square Zone', type: 'safe', lat: 20.2563, lng: 85.7808, radius: 1200 },
  { id: 3, name: 'Jaydev Vihar Zone', type: 'safe', lat: 20.2965, lng: 85.8196, radius: 1500 },
  { id: 4, name: 'Rajarani Temple Zone', type: 'safe', lat: 20.2434, lng: 85.8421, radius: 900 },
  { id: 5, name: 'Bindu Sagar Heritage Zone', type: 'safe', lat: 20.2418, lng: 85.8348, radius: 800 },
  { id: 6, name: 'Infocity Patia Zone', type: 'safe', lat: 20.3531, lng: 85.8169, radius: 1700 },
  { id: 7, name: 'Master Canteen Central Zone', type: 'safe', lat: 20.2727, lng: 85.8415, radius: 1400 },
  { id: 8, name: 'Kalinga Stadium Zone', type: 'safe', lat: 20.2892, lng: 85.8248, radius: 1500 },
  { id: 9, name: 'BDA Nicco Park Zone', type: 'safe', lat: 20.3018, lng: 85.8362, radius: 1000 },
  { id: 10, name: 'Odisha State Museum Zone', type: 'safe', lat: 20.2597, lng: 85.8409, radius: 900 },
  { id: 11, name: 'Lingaraj Temple Tourist Zone', type: 'safe', lat: 20.2386, lng: 85.8334, radius: 1200 },
  { id: 12, name: 'Railway Station Warning Hotspot', type: 'danger', lat: 20.2739, lng: 85.8421, radius: 400, reason: 'Crowd/Pickpocket Risk' },
  { id: 13, name: 'Bus Terminal Warning Hotspot', type: 'danger', lat: 20.2608, lng: 85.8436, radius: 400, reason: 'Heavy Transit Activity' },
  { id: 14, name: 'Night Travel Caution Corridor', type: 'danger', lat: 20.3152, lng: 85.8210, radius: 1400, reason: 'Low Activity at Night' },
  { id: 15, name: 'Market Congestion Hotspot', type: 'danger', lat: 20.2648, lng: 85.8345, radius: 450, reason: 'Crowded Market Risk' },
  { id: 16, name: 'Peripheral Road Caution Zone', type: 'danger', lat: 20.3450, lng: 85.7900, radius: 1500, reason: 'Isolated Route Warning' },
];

export const zoneService = {
  getAll(): SafetyZone[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    let zones: SafetyZone[] = [];
    
    if (!stored) {
      zones = [...defaultZones];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
    } else {
      try {
        zones = JSON.parse(stored);
        let changed = false;
        
        // 1. Merge missing default zones
        const storedIds = new Set(zones.map(z => z.id));
        const missingZones = defaultZones.filter(z => !storedIds.has(z.id));
        if (missingZones.length > 0) {
          zones = [...zones, ...missingZones];
          changed = true;
        }

        // 2. Update existing default zones if they've changed (for radius/name updates)
        zones = zones.map(z => {
          const defaultVer = defaultZones.find(d => d.id === z.id);
          if (defaultVer && (defaultVer.radius !== z.radius || defaultVer.name !== z.name)) {
            changed = true;
            return { ...z, ...defaultVer }; // Take updates from default
          }
          return z;
        });
        
        if (changed) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
        }
      } catch {
        zones = [...defaultZones];
      }
    }
    return zones;
  },

  add(zone: Omit<SafetyZone, 'id'> & { id?: string | number }): void {
    const zones = this.getAll();
    const newZone: SafetyZone = { ...zone, id: zone.id || Date.now() };
    // Remove if already exists with same id to allow updating
    const filtered = zones.filter(z => z.id !== newZone.id);
    const updated = [...filtered, newZone];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  remove(id: string | number): void {
    const zones = this.getAll();
    const updated = zones.filter(z => z.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  removeByIncidentId(incidentId: string): void {
    const zones = this.getAll();
    // Assuming we use incidentId as part of the string ID when we add it
    const updated = zones.filter(z => z.id !== `inc_${incidentId}`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
