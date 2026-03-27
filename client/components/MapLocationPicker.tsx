import React, { useRef, useEffect, useCallback } from 'react';
import L from 'leaflet';

interface MapLocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapLocationPicker({
  latitude,
  longitude,
  onLocationSelect,
}: MapLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const clickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null);

  // Stable click handler callback
  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    console.log('✓ Harita tıklaması tespit edildi:', {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    });
    onLocationSelect(e.latlng.lat, e.latlng.lng);
  }, [onLocationSelect]);

  // Harita başlatma
  useEffect(() => {
    // Container kontrolü
    if (!mapContainerRef.current) {
      console.error('✗ Harita container bulunamadı');
      return;
    }

    // Zaten map instance var ise, yeni oluşturmayız
    if (mapRef.current) {
      console.warn('⚠ Harita zaten başlatılmış');
      return;
    }

    console.log('🗺️ Harita başlatılıyor...');

    const mapInstance = L.map(mapContainerRef.current, {
      dragging: true,
      tap: true,
      touchZoom: true,
      zoomControl: true,
      attributionControl: true,
    }).setView([20, 0], 2);

    mapRef.current = mapInstance;
    console.log('✓ Harita instance oluşturuldu');

    // OpenStreetMap tile layer ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    // Click event listener ekle
    mapInstance.on('click', handleMapClick);
    console.log('✓ Click event listener eklendi');

    // Cleanup function
    return () => {
      console.log('🧹 Harita temizleniyor...');
      if (mapInstance) {
        mapInstance.off('click', handleMapClick);
        mapInstance.remove();
      }
      mapRef.current = null;
      console.log('✓ Harita temizlendi');
    };
  }, []);

  // Marker güncelle
  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) return;

    try {
      // Eski marker'ı kaldır
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }

      // Yeni marker ekle
      const markerIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        shadowAnchor: [12, 41],
      });

      markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(mapRef.current);

      // Harita merkez konumunu güncelle ve boyutunu geçersiz kıl
      mapRef.current.invalidateSize();
      mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    } catch (error) {
      console.error('Marker ekleme hatası:', error);
    }
  }, [latitude, longitude]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
