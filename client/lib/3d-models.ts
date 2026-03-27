/**
 * 3D Model ve Katman Üretim Yardımcıları
 */
import * as THREE from 'three';

export interface Model3DConfig {
  type?: string;
  depth?: { min: number; max: number };
  areaRadius?: number;
  color?: string;
  opacity?: number;
  [key: string]: any;
}

export const createModelByType = (type: string, config: Model3DConfig): THREE.Group => {
  const group = new THREE.Group();

  // Varsayılan renkler
  const colors: { [key: string]: number } = {
    pyramid: 0xff6b6b,
    cube: 0x4ecdc4,
    sphere: 0xf7b731,
    cylinder: 0x5f27cd
  };

  const color = colors[type] || 0x4a90e2;

  // Yapı tipine göre geometri oluştur
  let geometry: THREE.BufferGeometry;

  switch(type) {
    case 'pyramid':
      geometry = new THREE.ConeGeometry(2, 3, 4);
      break;
    case 'cube':
      geometry = new THREE.BoxGeometry(2, 2, 2);
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(1.5, 32, 32);
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(1, 1, 3, 32);
      break;
    default:
      geometry = new THREE.BoxGeometry(2, 2, 2);
  }

  const material = new THREE.MeshPhongMaterial({
    color,
    emissive: 0x111111,
    shininess: 100
  });

  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  return group;
};

export const createSoilLayer = (depth: number, radius: number): THREE.Mesh => {
  const geometry = new THREE.CylinderGeometry(radius * 1.2, radius * 1.2, depth, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.8,
    metalness: 0.2
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -depth / 2;

  return mesh;
};

export const updatePulseAnimation = (object: THREE.Object3D, elapsed: number): void => {
  if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshPhongMaterial) {
    const pulse = Math.sin(elapsed * 2) * 0.3 + 0.7;
    object.material.emissive.setHex(0x111111);
    object.scale.set(pulse, pulse, pulse);
  }
};
