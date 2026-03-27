import { useEffect, useRef, useState, useCallback } from 'react';

export interface CameraOptions {
  audio?: boolean;
  video?: {
    facingMode?: 'user' | 'environment' | { exact: string };
    width?: number | { ideal: number };
    height?: number | { ideal: number };
  };
}

export interface CameraState {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  isPermissionGranted: boolean;
  isSupported: boolean;
}

export const useCameraWithPermission = (options: CameraOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraState>({
    stream: null,
    isLoading: false,
    error: null,
    isPermissionGranted: false,
    isSupported: !!navigator.mediaDevices?.getUserMedia,
  });

  // Kamera izni kontrol et
  const checkPermission = useCallback(async () => {
    try {
      if (!navigator.permissions?.query) {
        console.log('Permissions API desteklenmiyor');
        return undefined;
      }

      const permission = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });
      return permission.state;
    } catch (err) {
      console.error('İzin sorgusu hatası:', err);
      return undefined;
    }
  }, []);

  // Arka kamera başlat
  const startCamera = useCallback(
    async (
      constraints: CameraOptions = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }
    ) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        if (!state.isSupported) {
          throw new Error('Kamera özelliği bu cihazda desteklenmiyor');
        }

        // Mevcut stream'i durdur
        if (state.stream) {
          state.stream.getTracks().forEach((track) => track.stop());
        }

        // Kamera izni iste (Arka kamera!)
        const stream = await navigator.mediaDevices.getUserMedia({
          ...constraints,
          video: {
            ...constraints.video,
            facingMode: 'environment', // MUTLAKA arka kamera
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Video oynatmasını başlat
          await videoRef.current.play().catch(() => {
            // Autoplay izni olmadığında, play() başarısız olabilir
          });
        }

        setState((prev) => ({
          ...prev,
          stream,
          isLoading: false,
          isPermissionGranted: true,
        }));

        return stream;
      } catch (err) {
        const errorMessage =
          err instanceof DOMException
            ? err.name === 'NotAllowedError'
              ? 'Kamera izni reddedildi'
              : err.name === 'NotFoundError'
              ? 'Kamera cihazı bulunamadı'
              : err.message
            : 'Kamera başlatılamadı';

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          isPermissionGranted: false,
        }));

        throw err;
      }
    },
    [state.isSupported, state.stream]
  );

  // Kamerayı durdur
  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setState((prev) => ({ ...prev, stream: null }));
    }
  }, [state.stream]);

  // İzin isteğini göster
  const requestPermission = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const permission = await checkPermission();

      if (permission === 'denied') {
        setState((prev) => ({
          ...prev,
          error: 'Kamera izni reddedildi. Ayarlardan etkinleştirin.',
          isLoading: false,
        }));
        return false;
      }

      if (permission === 'granted') {
        setState((prev) => ({ ...prev, isPermissionGranted: true }));
        return true;
      }

      // 'prompt' durumunda kamerayı başlatmaya çalış
      await startCamera();
      return true;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: 'İzin isteği başarısız',
        isLoading: false,
      }));
      return false;
    }
  }, [checkPermission, startCamera]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    ...state,
    startCamera,
    stopCamera,
    requestPermission,
    checkPermission,
  };
};

// Kamera izinlerini kontrol eden hook
export const useCameraPermission = () => {
  const [permissionState, setPermissionState] = useState<
    'granted' | 'denied' | 'prompt' | 'unknown'
  >('unknown');
  const [isChecking, setIsChecking] = useState(false);

  const checkCameraPermission = useCallback(async () => {
    try {
      setIsChecking(true);

      if (!navigator.permissions?.query) {
        setPermissionState('unknown');
        return 'unknown';
      }

      const result = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });

      const state = result.state as
        | 'granted'
        | 'denied'
        | 'prompt'
        | 'unknown';
      setPermissionState(state);

      // İzin değişikliğini izle
      result.addEventListener('change', () => {
        setPermissionState(result.state as any);
      });

      return state;
    } catch (err) {
      console.error('İzin sorgusu başarısız:', err);
      setPermissionState('unknown');
      return 'unknown';
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkCameraPermission();
  }, [checkCameraPermission]);

  return { permissionState, isChecking, checkCameraPermission };
};

// Fotoğraf çekme fonksiyonu
export const captureFrame = (
  videoElement: HTMLVideoElement
): { blob: Blob; dataUrl: string } | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.95),
      blob: new Blob([canvas.toDataURL('image/jpeg', 0.95)], {
        type: 'image/jpeg',
      }),
    };
  } catch (err) {
    console.error('Fotoğraf çekme hatası:', err);
    return null;
  }
};

// Video kayıt fonksiyonu
export class CameraRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private isRecording = false;

  startRecording(stream: MediaStream) {
    try {
      this.chunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        this.chunks.push(event.data);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Kayıt başlatma hatası:', err);
      return false;
    }
  }

  stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  getRecordingStatus() {
    return this.isRecording;
  }
}
