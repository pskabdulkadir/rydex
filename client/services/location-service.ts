/**
 * Konum Servisi
 * navigator.geolocation API'sini kullanarak cihazın mevcut konumunu alır
 * (Capacitor'un Web API uyumluluğu için)
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number; // metre cinsinden
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationPermission {
  gps: "granted" | "denied" | "prompt";
}

export class LocationService {
  private currentLocation: LocationCoordinates | null = null;
  private isListening = false;
  private watchId: number | null = null;

  /**
   * GPS izni iste ve kontrol et
   */
  async requestPermission(): Promise<boolean> {
    try {
      // navigator.permissions API ile kontrol et
      if (navigator.permissions?.query) {
        const permission = await navigator.permissions.query({
          name: 'geolocation' as PermissionName,
        });
        return permission.state !== 'denied';
      }
      // Fallback: doğrudan getCurrentPosition'ı dene
      return true;
    } catch (error) {
      console.error("GPS izni hatası:", error);
      return false;
    }
  }

  /**
   * Mevcut konumu tek seferlik al
   */
  async getCurrentPosition(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation API bu cihazda desteklenmiyor"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
            timestamp: position.timestamp,
          };
          resolve(this.currentLocation);
        },
        (error) => {
          console.error("Konum alınamadı:", error);
          reject(new Error(`GPS konumu alınamadı: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Konumu sürekli dinle (GPS tracking)
   */
  async startLocationTracking(
    onLocationChange: (location: LocationCoordinates) => void,
    onError?: (error: Error) => void
  ): Promise<number> {
    try {
      if (this.isListening && this.watchId !== null) {
        // Zaten dinleniyor
        return this.watchId;
      }

      if (!navigator.geolocation) {
        throw new Error("Geolocation API bu cihazda desteklenmiyor");
      }

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
            timestamp: position.timestamp,
          };
          onLocationChange(this.currentLocation);
        },
        (error) => {
          console.error("Konumu takip etme hatası:", error);
          if (onError) onError(new Error(`Konum takip hatası: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );

      this.isListening = true;
      return this.watchId;
    } catch (error) {
      console.error("Konumu takip etme başlatma hatası:", error);
      throw new Error("Konum takip başlatılamadı");
    }
  }

  /**
   * Konum izlemeyi durdur
   */
  async stopLocationTracking(): Promise<void> {
    try {
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
        this.isListening = false;
      }
    } catch (error) {
      console.error("Konumu takip etmeyi durdurma hatası:", error);
    }
  }

  /**
   * Mevcut konumu getir (cache'den)
   */
  getLastKnownLocation(): LocationCoordinates | null {
    return this.currentLocation;
  }

  /**
   * Dinleme durumunu kontrol et
   */
  isTracking(): boolean {
    return this.isListening;
  }

  /**
   * İki konum arasındaki mesafeyi hesapla (Haversine formülü)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Konum doğruluk seviyesini kontrol et
   */
  isAccurate(minAccuracyMetres: number = 50): boolean {
    if (!this.currentLocation) return false;
    return this.currentLocation.accuracy <= minAccuracyMetres;
  }

  /**
   * Konum alındığından bu yana geçen süreyi kontrol et
   */
  getLocationAge(): number {
    if (!this.currentLocation) return Infinity;
    return Date.now() - this.currentLocation.timestamp;
  }
}

// Global instance
export const locationService = new LocationService();
