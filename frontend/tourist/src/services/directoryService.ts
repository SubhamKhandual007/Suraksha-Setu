export interface DirectoryEntry {
  id: string;
  name: string;
  phone: string;
  distance: string;
  status: 'Available' | 'Busy' | 'Responding' | 'Ready' | 'En Route';
  type: 'hospital' | 'police' | 'ambulance';
  lat: number;
  lng: number;
  eta?: string;
  vehicleNo?: string;
}

class DirectoryService {
  private STORAGE_KEY = 'suraksha_emergency_directory';

  private DEFAULT_ENTRIES: DirectoryEntry[] = [
    { id: 'h1', name: 'AIIMS Bhubaneswar', phone: '0674 247 6789', distance: '1.2 km', status: 'Available', type: 'hospital', lat: 20.2281, lng: 85.8080 },
    { id: 'h2', name: 'Capital Hospital', phone: '0674 239 1983', distance: '2.5 km', status: 'Busy', type: 'hospital', lat: 20.2520, lng: 85.8335 },
    { id: 'h3', name: 'SUM Hospital', phone: '0674 238 6211', distance: '4.8 km', status: 'Available', type: 'hospital', lat: 20.2961, lng: 85.8245 },
    { id: 'p1', name: 'Khandagiri Police Station', phone: '0674 235 0200', distance: '0.8 km', status: 'Available', type: 'police', lat: 20.2563, lng: 85.7808 },
    { id: 'p2', name: 'Nayapalli Police Station', phone: '0674 255 1454', distance: '3.2 km', status: 'Available', type: 'police', lat: 20.2952, lng: 85.8214 },
    { id: 'a1', name: 'Smart Ambulance 108', phone: '108', distance: '—', status: 'Ready', type: 'ambulance', lat: 0, lng: 0, eta: '8 mins' },
  ];

  constructor() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.save(this.DEFAULT_ENTRIES);
    }
  }

  getAll(): DirectoryEntry[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : this.DEFAULT_ENTRIES;
  }

  getByType(type: 'hospital' | 'police' | 'ambulance'): DirectoryEntry[] {
    return this.getAll().filter(e => e.type === type);
  }

  save(entries: DirectoryEntry[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  }

  updateEntry(id: string, updates: Partial<DirectoryEntry>): void {
    const entries = this.getAll();
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates };
      this.save(entries);
    }
  }

  addEntry(entry: Omit<DirectoryEntry, 'id'>): void {
    const entries = this.getAll();
    const newEntry = { ...entry, id: Date.now().toString() };
    entries.push(newEntry);
    this.save(entries);
  }

  deleteEntry(id: string): void {
    const entries = this.getAll().filter(e => e.id !== id);
    this.save(entries);
  }
}

export const directoryService = new DirectoryService();
export default directoryService;
