/**
 * Tarama Durumu Yöneticisi
 * Amaç: Tarama yapılmadan HİÇBİR veri gösterilmemesini garantilemek
 * 
 * Akış:
 * 1. IDLE (başlangıç) -> Veri gösterilmez
 * 2. SCANNING (tarama devam ediyor) -> Animasyon, durumu göster
 * 3. PROCESSING (veriler işleniyor) -> "İşleniyor..." göster
 * 4. COMPLETED (tarama tamamlandı) -> Tüm ger çek verileri göster
 * 5. FAILED (hata) -> Hata mesajı göster
 */

import { RealDataResponse } from "@shared/real-data-service";
import { LocationCoordinates } from "./location-service";

export type ScanStatus = "idle" | "scanning" | "processing" | "completed" | "failed";

export interface ScanSession {
  id: string;
  status: ScanStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  location: LocationCoordinates;
  depth?: number;        // Metre cinsinden manuel girilen derinlik
  area?: number;         // m² cinsinden manuel girilen alan
  scanType?: string;     // Tarama türü
  realData?: RealDataResponse;
  error?: string;
  progress: number; // 0-100
}

export class ScanStateManager {
  private currentSession: ScanSession | null = null;
  private sessionHistory: ScanSession[] = [];
  private listeners: ((session: ScanSession | null) => void)[] = [];

  /**
   * Yeni tarama başlat
   * @param location Konum bilgisi
   * @param opts İsteğe bağlı: depth (m), area (m²), scanType (tarama türü)
   */
  startScan(location: LocationCoordinates, opts?: { depth?: number; area?: number; scanType?: string }): ScanSession {
    this.currentSession = {
      id: this.generateSessionId(),
      status: "scanning",
      startTime: Date.now(),
      location,
      depth: opts?.depth,
      area: opts?.area,
      scanType: opts?.scanType,
      progress: 0,
    };

    this.notifyListeners();
    return this.currentSession;
  }

  /**
   * Tarama ilerlemesini güncelle
   */
  updateProgress(progress: number): void {
    if (!this.currentSession || this.currentSession.status === "completed") {
      return;
    }

    this.currentSession.progress = Math.min(100, Math.max(0, progress));
    this.notifyListeners();
  }

  /**
   * Taramaya şu anda gerçek veri ekle ve tamamla
   */
  completeScan(realData: RealDataResponse): ScanSession {
    if (!this.currentSession) {
      throw new Error("Tarama oturumu başlatılmamış");
    }

    const endTime = Date.now();
    this.currentSession.status = "completed";
    this.currentSession.realData = realData;
    this.currentSession.endTime = endTime;
    this.currentSession.duration = endTime - this.currentSession.startTime;
    this.currentSession.progress = 100;

    // Geçmişe ekle
    this.sessionHistory.push(this.currentSession);

    this.notifyListeners();
    return this.currentSession;
  }

  /**
   * Taramada hata ile bitir
   */
  failScan(error: string): ScanSession {
    if (!this.currentSession) {
      throw new Error("Tarama oturumu başlatılmamış");
    }

    const endTime = Date.now();
    this.currentSession.status = "failed";
    this.currentSession.error = error;
    this.currentSession.endTime = endTime;
    this.currentSession.duration = endTime - this.currentSession.startTime;

    this.notifyListeners();
    return this.currentSession;
  }

  /**
   * Taramayı iptal et (geri dön IDLE durumuna)
   */
  cancelScan(): void {
    this.currentSession = null;
    this.notifyListeners();
  }

  /**
   * Mevcut tarama oturumunu getir
   */
  getCurrentSession(): ScanSession | null {
    return this.currentSession;
  }

  /**
   * Geçmiş taramaları getir
   */
  getHistory(): ScanSession[] {
    return this.sessionHistory;
  }

  /**
   * İstatistikler
   */
  getStatistics() {
    const completed = this.sessionHistory.filter((s) => s.status === "completed");
    const failed = this.sessionHistory.filter((s) => s.status === "failed");

    return {
      totalScans: this.sessionHistory.length,
      completedScans: completed.length,
      failedScans: failed.length,
      averageDuration:
        completed.length > 0
          ? completed.reduce((sum, s) => sum + (s.duration || 0), 0) / completed.length
          : 0,
      lastScanTime: this.sessionHistory[this.sessionHistory.length - 1]?.endTime,
    };
  }

  /**
   * Durum değişikliklerini dinle
   */
  subscribe(callback: (session: ScanSession | null) => void): () => void {
    this.listeners.push(callback);

    // Unsubscribe fonksiyonu döndür
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /**
   * Tüm verileri getir (Completed durum gerekliyse)
   * ÖNEMLI: Bu fonksiyon sadece tarama tamamlandıysa gerçek verileri döndürür
   */
  getDisplayData() {
    if (!this.currentSession) {
      return {
        showData: false,
        data: null,
        status: "idle" as const,
      };
    }

    // Sadece tamamlanmış tarama sonrası gerçek veriler gösterilebilir
    if (this.currentSession.status === "completed" && this.currentSession.realData) {
      return {
        showData: true,
        data: this.currentSession.realData,
        status: "completed" as const,
      };
    }

    // Diğer durumlarda veri gösterilmez
    return {
      showData: false,
      data: null,
      status: this.currentSession.status,
    };
  }

  /**
   * Tüm geçmişi ve mevcut oturumu sil
   */
  clearAll(): void {
    this.currentSession = null;
    this.sessionHistory = [];
    this.notifyListeners();
  }

  /**
   * Özel bir oturumu sil
   */
  deleteSession(sessionId: string): void {
    this.sessionHistory = this.sessionHistory.filter((s) => s.id !== sessionId);
    if (this.currentSession?.id === sessionId) {
      this.currentSession = null;
    }
    this.notifyListeners();
  }

  /**
   * Destekçi Fonksiyonlar
   */

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentSession));
  }
}

// Global instance
export const scanStateManager = new ScanStateManager();
