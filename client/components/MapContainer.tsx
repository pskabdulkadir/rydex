import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const LeafletMapContainer = MapContainer as any;
const LeafletTileLayer = TileLayer as any;
const LeafletMarker = Marker as any;

interface Detection {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  magnitude?: number;
  accuracy?: number;
  confidence?: number;
  magneticField?: number;
  resourceType?: string;
  type?: string;
}

interface MapContainerComponentProps {
  center: [number, number];
  zoom?: number;
  userLocation?: [number, number];
  detections: Detection[];
  height?: string;
}

// Leaflet ikonu ayarları
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const detectionIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const MapContainerComponent: React.FC<MapContainerComponentProps> = ({
  center,
  zoom = 13,
  userLocation,
  detections,
  height = "100%",
}) => {
  return (
    <LeafletMapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: "100%" }}
    >
      <LeafletTileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Kullanıcı konumu */}
      {userLocation && (
        <LeafletMarker position={userLocation} icon={defaultIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold">Mevcut Konum</p>
              <p className="text-xs text-slate-600">
                {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
              </p>
            </div>
          </Popup>
        </LeafletMarker>
      )}

      {/* Tespit edilen anomaliler */}
      {detections.map((detection) => (
        <LeafletMarker
          key={detection.id}
          position={[detection.latitude, detection.longitude]}
          icon={detectionIcon}
        >
          <Popup>
            <div className="text-center text-xs">
              <p className="font-bold text-red-600">Anomali Tespit Edildi</p>
              {detection.magnitude && (
                <p className="text-sm">
                  Büyüklük: <strong>{detection.magnitude.toFixed(1)} μT</strong>
                </p>
              )}
              {detection.magneticField && (
                <p className="text-sm">
                  Manyetik Alan: <strong>{detection.magneticField.toFixed(2)}</strong>
                </p>
              )}
              {detection.resourceType && (
                <p className="text-sm">
                  Tür: <strong>{detection.resourceType}</strong>
                </p>
              )}
              {detection.accuracy && (
                <p className="text-xs text-slate-600">
                  Doğruluk: {detection.accuracy.toFixed(1)}m
                </p>
              )}
              {detection.confidence && (
                <p className="text-xs text-slate-600">
                  Güven: {(detection.confidence * 100).toFixed(0)}%
                </p>
              )}
              <p className="text-xs text-slate-500">
                {new Date(detection.timestamp).toLocaleString("tr-TR")}
              </p>
            </div>
          </Popup>
        </LeafletMarker>
      ))}
    </LeafletMapContainer>
  );
};

export default MapContainerComponent;
