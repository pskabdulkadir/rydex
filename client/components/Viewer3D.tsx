import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { createModelByType, createSoilLayer, updatePulseAnimation, Model3DConfig } from '@/lib/3d-models';
import { Eye, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Viewer3DProps {
  config: Model3DConfig;
  structureType: string;
}

/**
 * 3D Scene Component
 */
function Scene({ config, structureType }: Viewer3DProps) {
  const sceneRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [soilLayer, setSoilLayer] = useState<THREE.Mesh | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    // Create soil layer
    const soil = createSoilLayer(
      (config.depth.min + config.depth.max) / 2,
      config.areaRadius
    );
    setSoilLayer(soil);

    // Create structure model
    const newModel = createModelByType(structureType, config);
    setModel(newModel);
  }, [config, structureType]);

  useFrame((state) => {
    // Animate pulse
    if (model && model.children) {
      model.children.forEach((child) => {
        updatePulseAnimation(child, state.clock.elapsedTime);
      });
    }

    // Gentle camera rotation
    if (sceneRef.current) {
      sceneRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color={0x4a90e2} />

      {/* Scene Group */}
      <group ref={sceneRef}>
        {/* Soil Background */}
        {soilLayer && <primitive object={soilLayer} />}

        {/* Structure Model */}
        {model && <primitive object={model} />}

        {/* Grid helper for reference */}
        <gridHelper args={[20, 20, 0x333333, 0x111111]} position={[0, -3, 0]} />
      </group>
    </>
  );
}

/**
 * Loading Fallback
 */
function SceneLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      <div className="text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <p>3D Model yükleniyor...</p>
      </div>
    </div>
  );
}

/**
 * Main 3D Viewer Component
 */
export default function Viewer3D({ config, structureType }: Viewer3DProps) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Suspense fallback={<SceneLoader />}>
        <Canvas
          camera={{ position: [0, 3, 8], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Scene config={config} structureType={structureType} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            autoRotate
            autoRotateSpeed={4}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
