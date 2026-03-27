import { toast } from "sonner";

export class AlertSystem {
  private audioContext: AudioContext | null = null;
  private isVibrationSupported: boolean = "vibrate" in navigator;

  /**
   * Sesli uyarı çal
   */
  playAudioAlert(frequency: number = 1000, duration: number = 500): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        context.currentTime + duration / 1000
      );

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration / 1000);
    } catch (error) {
      console.warn("Sesli uyarı çalıştırılamadı:", error);
    }
  }

  /**
   * Titreşim uyarısı (haptic feedback)
   */
  triggerVibration(pattern: number | number[] = 200): void {
    if (this.isVibrationSupported) {
      try {
        navigator.vibrate(pattern);
      } catch (error) {
        console.warn("Titreşim uyarısı tetiklenemedi:", error);
      }
    }
  }

  /**
   * Tehlike seviyesine göre uyarı ver
   */
  triggerAlert(magneticStrength: number, threshold: number): void {
    if (magneticStrength > threshold) {
      const level = Math.min(100, (magneticStrength / threshold) * 100);

      if (level > 150) {
        // KRITIK
        this.playAudioAlert(1500, 200);
        this.triggerVibration([100, 100, 100, 100]);
      } else if (level > 120) {
        // YÜKSEK
        this.playAudioAlert(1000, 300);
        this.triggerVibration([200, 100, 200]);
      } else {
        // ORTA
        this.playAudioAlert(800, 200);
        this.triggerVibration([100, 50, 100]);
      }
    }
  }

  /**
   * Görsel uyarı (Toast)
   */
  showVisualAlert(
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "warning"
  ): void {
    switch (type) {
      case "success":
        toast.success(title, { description: message });
        break;
      case "error":
        toast.error(title, { description: message });
        break;
      case "warning":
        toast.warning(title, { description: message });
        break;
      case "info":
        toast.info(title, { description: message });
        break;
    }
  }

  /**
   * Büyük anormalite tespit edildi - Kombineli uyarı
   */
  triggerCriticalAlert(
    resourceType: string,
    magneticStrength: number
  ): void {
    // Sesli
    this.playAudioAlert(1500, 500);

    // Titreşim
    this.triggerVibration([100, 100, 100, 100, 100, 100]);

    // Görsel
    this.showVisualAlert(
      `🎯 ${resourceType} Tespit Edildi!`,
      `Manyetik şiddet: ${magneticStrength.toFixed(2)} µT`,
      "success"
    );
  }

  /**
   * Sesli kaynağı durdur
   */
  stopAudio(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const alertSystem = new AlertSystem();
