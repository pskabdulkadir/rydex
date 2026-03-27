import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.archaeoscanner.mobile',
  appName: 'ArchaeoScanner',
  appUrl: 'http://localhost:8080',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https',
    // Development: http://localhost:8080
    // Production: https (APK içerisindeki web uygulaması)
    allowNavigation: ['localhost', '*.example.com'],
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'capacitor',
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      signingType: 'jarsigner',
      releaseType: 'APK',
    },
    scheme: 'https',
  },
  plugins: {
    // GPS/Konum izni
    Geolocation: {
      permissions: ['geolocation', 'location', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    },
    // Ağ bağlantısı
    Network: {
      permissions: ['internet', 'change_network_state', 'access_network_state'],
    },
    // Uygulama izinleri
    App: {
      permissions: ['internet', 'write_external_storage', 'read_external_storage'],
    },
    // Kamera izni (Capacitor camera)
    Camera: {
      permissions: ['camera', 'read_external_storage', 'write_external_storage', 'RECORD_AUDIO'],
    },
    // Manyetometre sensörü (DeviceMotion API)
    DeviceMotion: {
      permissions: [],
    },
    // Sensör erişimi
    Motion: {
      permissions: [],
    },
  },
};

/**
 * AndroidManifest.xml'ye eklenecek permissions ve features:
 *
 * PERMISSIONS:
 * <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
 * <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
 * <uses-permission android:name="android.permission.INTERNET" />
 * <uses-permission android:name="android.permission.CAMERA" />
 * <uses-permission android:name="android.permission.RECORD_AUDIO" />
 * <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
 * <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
 * <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
 * <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
 * <uses-permission android:name="android.permission.VIBRATE" />
 * <uses-permission android:name="android.permission.BODY_SENSORS" />
 *
 * FEATURES:
 * <uses-feature android:name="android.hardware.location" android:required="false" />
 * <uses-feature android:name="android.hardware.location.gps" android:required="false" />
 * <uses-feature android:name="android.hardware.camera" android:required="false" />
 * <uses-feature android:name="android.hardware.camera.any" android:required="true" />
 * <uses-feature android:name="android.hardware.sensor.compass" android:required="false" />
 * <uses-feature android:name="android.hardware.sensor.accelerometer" android:required="false" />
 *
 * NOT: Magnetometer API (DeviceMotionEvent) Android'da doğrudan izin gerektirmez
 * ancak BODY_SENSORS izni gerekebilir (API 29+)
 */

export default config;
