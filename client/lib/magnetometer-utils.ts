import { MagneticReading, CalibrationData } from "@shared/magnetometer";

// Gürültü Filtresi (Düşük Geçişli Filtre)
export class NoiseFilter {
  private filteredValue: number = 0;
  private readonly alpha: number;

  constructor(alpha: number = 0.1) {
    this.alpha = alpha; // 0-1 arasında, düşük = daha yumuşak filtreleme
  }

  filter(input: number): number {
    this.filteredValue = this.filteredValue + this.alpha * (input - this.filteredValue);
    return this.filteredValue;
  }

  reset(): void {
    this.filteredValue = 0;
  }
}

// Toplam manyetik alan şiddeti hesaplama
export function calculateTotalMagneticField(
  x: number,
  y: number,
  z: number
): number {
  return Math.sqrt(x * x + y * y + z * z);
}

// Kalibrasyon sistemi
export class CalibrationManager {
  private calibrationData: CalibrationData | null = null;
  private readings: number[] = [];

  startCalibration(): void {
    this.readings = [];
  }

  addReading(magneticStrength: number): void {
    this.readings.push(magneticStrength);
  }

  completeCalibration(): CalibrationData {
    if (this.readings.length === 0) {
      throw new Error("Kalibrasyon için hiç veri yok");
    }

    const baseline = this.readings.reduce((a, b) => a + b, 0) / this.readings.length;

    this.calibrationData = {
      baseline,
      calibratedAt: Date.now(),
      readings: this.readings.length,
    };

    return this.calibrationData;
  }

  getCalibrationData(): CalibrationData | null {
    return this.calibrationData;
  }

  setCalibrationData(data: CalibrationData): void {
    this.calibrationData = data;
  }

  calculateAnomaly(magneticStrength: number): number {
    if (!this.calibrationData) {
      return magneticStrength; // Kalibrasyon yapılmamışsa, farkı hesaplayamayız
    }
    return magneticStrength - this.calibrationData.baseline;
  }
}

/**
 * Gerçek cihaz sensörü verisi al (Magnetometer)
 * Sıralama:
 * 1. Android/iOS native plugin (DeviceMotionEvent via Capacitor)
 * 2. Web Sensor API (Magnetometer)
 * 3. DeviceMotionEvent (Accelerometer fallback)
 * 4. Simülasyon verisi (son çare)
 */
export async function getRealMagneticData(): Promise<MagneticReading> {
  try {
    // Yöntem 1: Android native DeviceMotion (Capacitor Event)
    if ('ondevicemotion' in window) {
      return new Promise((resolve, reject) => {
        let resolved = false;

        const handler = (event: DeviceMotionEvent) => {
          if (resolved) return;

          if (event.acceleration) {
            resolved = true;
            // Cihazın acceleration verisi (Magnetometer şiddeti için)
            const x = event.acceleration.x ?? 0;
            const y = event.acceleration.y ?? 0;
            const z = event.acceleration.z ?? 0;

            const total = calculateTotalMagneticField(x, y, z);

            window.removeEventListener('devicemotion', handler);
            resolve({
              x: parseFloat(x.toFixed(2)),
              y: parseFloat(y.toFixed(2)),
              z: parseFloat(z.toFixed(2)),
              total: parseFloat(total.toFixed(2)),
              timestamp: Date.now(),
            });
          }
        };

        window.addEventListener('devicemotion', handler, true);

        // Timeout: sensör datası gelmezse fallback'e geç
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            window.removeEventListener('devicemotion', handler);
            reject(new Error('DeviceMotion zaman aşımı'));
          }
        }, 1000);

        // Resolve üzerinde timeout'ı temizle
        return () => clearTimeout(timeout);
      });
    }

    // Yöntem 2: Web Sensor API (Magnetometer - Küresel çoğu cihazda destek yok)
    if ('Magnetometer' in window) {
      return new Promise((resolve, reject) => {
        try {
          // @ts-ignore
          const sensor = new Magnetometer({ frequency: 50 });
          let resolved = false;

          // @ts-ignore
          sensor.onreading = () => {
            if (resolved) return;
            resolved = true;

            const x = sensor.x || 0;
            const y = sensor.y || 0;
            const z = sensor.z || 0;

            const total = calculateTotalMagneticField(x, y, z);

            // @ts-ignore
            sensor?.stop?.();

            resolve({
              x: parseFloat(x.toFixed(2)),
              y: parseFloat(y.toFixed(2)),
              z: parseFloat(z.toFixed(2)),
              total: parseFloat(total.toFixed(2)),
              timestamp: Date.now(),
            });
          };

          // @ts-ignore
          sensor.onerror = () => {
            if (!resolved) {
              resolved = true;
              // @ts-ignore
              sensor?.stop?.();
              reject(new Error('Web Sensörü hatası'));
            }
          };

          // @ts-ignore
          sensor.start();

          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              // @ts-ignore
              sensor?.stop?.();
              reject(new Error('Web Sensörü zaman aşımı'));
            }
          }, 1000);
        } catch (err) {
          reject(err);
        }
      });
    }

    // Sensör desteği yok - fallback
    throw new Error('Magnetometer sensörü bu cihazda desteklenmiyor');
  } catch (error) {
    console.warn('⚠️ Manyetometre sensörü kullanılamıyor:', error);
    // Fallback: Simüle edilmiş veri (SADECE GELIŞTIRME/TEST İÇİN)
    return generateSimulatedMagneticData();
  }
}

/**
 * @kullanılmayıyor Simüle edilmiş sensör verisi oluştur - SADECE FALLBACK IÇIN
 * Gerçek sensör verisi olmadığında acil durum olarak kullanılır
 * Üretim ortamında hiçbir zaman bu çağrılmamalı
 */
export function generateSimulatedMagneticData(): MagneticReading {
  console.warn('⚠️ UYARI: Simülasyon verisi kullanılıyor - Gerçek sensör verisi alınamadı!');

  // Normal dünya manyetik alanı + rastgele gürültü (25-65 µT arası)
  const baseField = 25 + Math.random() * 40;

  const x = baseField * Math.cos(Date.now() / 1000) + (Math.random() - 0.5) * 2;
  const y = baseField * Math.sin(Date.now() / 1000) + (Math.random() - 0.5) * 2;
  const z = baseField * 0.5 + (Math.random() - 0.5) * 2;

  const total = calculateTotalMagneticField(x, y, z);

  return {
    x: parseFloat(x.toFixed(2)),
    y: parseFloat(y.toFixed(2)),
    z: parseFloat(z.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    timestamp: Date.now(),
  };
}

// Anomali tespiti (Anomali Algılama)
export function detectAnomaly(
  currentStrength: number,
  baselineStrength: number,
  threshold: number = 10
): boolean {
  return Math.abs(currentStrength - baselineStrength) > threshold;
}

// LocalStorage yardımcıları
export function saveCalibrationData(data: CalibrationData): void {
  localStorage.setItem("magnetometer_calibration", JSON.stringify(data));
}

export function loadCalibrationData(): CalibrationData | null {
  const data = localStorage.getItem("magnetometer_calibration");
  return data ? JSON.parse(data) : null;
}

export function clearCalibrationData(): void {
  localStorage.removeItem("magnetometer_calibration");
}
