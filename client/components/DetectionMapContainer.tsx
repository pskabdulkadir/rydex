import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

interface Detection {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  magnitude: number;
  accuracy: number;
}

interface DetectionMapContainerProps {
  center: [number, number];
  zoom?: number;
  userLocation?: [number, number];
  detections: Detection[];
  selectedDetection: Detection | null;
  onDetectionSelect: (detection: Detection) => void;
}

const getMarkerColor = (magnitude: number): string => {
  if (magnitude > 100) return "#FFD700"; // Altın
  if (magnitude > 75) return "#FF6347"; // Kırmızı
  if (magnitude > 50) return "#FFA500"; // Turuncu
  return "#87CEEB"; // Mavi
};

const DetectionMapContainer: React.FC<DetectionMapContainerProps> = ({
  center,
  zoom = 13,
  userLocation,
  detections,
  onDetectionSelect,
}) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Kullanıcı Konumu */}
      {userLocation && (
        <>
          <Marker
            position={userLocation}
            icon={L.icon({
              iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-blue.png",
              shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>
              <p className="font-bold text-blue-600">Mevcut Konumunuz</p>
            </Popup>
          </Marker>
          <Circle
            center={userLocation}
            radius={500}
            pathOptions={{ color: "blue", fillOpacity: 0.1 }}
          />
        </>
      )}

      {/* Tespit Edilen Noktalar */}
      {detections.map((detection) => (
        <Marker
          key={detection.id}
          position={[detection.latitude, detection.longitude]}
          icon={L.divIcon({
            html: `<div style="background-color: ${getMarkerColor(
              detection.magnitude
            )}; color: white; border: 3px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">🎯</div>`,
            iconSize: [30, 30],
            className: "custom-marker",
          })}
          eventHandlers={{
            click: () => onDetectionSelect(detection),
          }}
        >
          <Popup>
            <div className="text-center text-xs">
              <p className="font-bold">Magnitude: {detection.magnitude.toFixed(1)} μT</p>
              <p className="text-gray-600">
                {detection.latitude.toFixed(4)}, {detection.longitude.toFixed(4)}
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(detection.timestamp).toLocaleString("tr-TR")}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default DetectionMapContainer;
