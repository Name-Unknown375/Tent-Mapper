import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../stores/useAppStore';
import type { CanvasItem as CanvasItemType } from '../../types';
import { ITEM_DEFINITIONS, PIXELS_PER_FOOT } from '../../types';

// Convert 2D canvas position to 3D world position
const canvasTo3D = (posX: number, posY: number) => {
  // Canvas is 300ft x 300ft, centered at origin in 3D
  const ftX = posX / PIXELS_PER_FOOT - 150;
  const ftZ = posY / PIXELS_PER_FOOT - 150;
  return { x: ftX, z: ftZ };
};

// Ground plane with grass texture
const Ground: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial color="#4a7c4e" />
    </mesh>
  );
};

// Tent component - renders tent structure with poles
const Tent3D: React.FC<{ item: CanvasItemType }> = ({ item }) => {
  const def = ITEM_DEFINITIONS[item.type];
  const pos = canvasTo3D(item.position.x, item.position.y);
  const width = def.widthFt || 20;
  const depth = def.heightFt || 20;
  const height = 10; // Tent peak height
  const wallHeight = 7; // Side wall height

  // Tent canvas material (semi-transparent white)
  const canvasMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#f5f5f0', side: THREE.DoubleSide, transparent: true, opacity: 0.85 }),
    []
  );

  // Pole material
  const poleMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#c0c0c0', metalness: 0.6 }),
    []
  );

  return (
    <group position={[pos.x + width / 2, 0, pos.z + depth / 2]} rotation={[0, (item.rotation * Math.PI) / 180, 0]}>
      {/* Corner poles */}
      {[
        [-width / 2 + 0.5, -depth / 2 + 0.5],
        [width / 2 - 0.5, -depth / 2 + 0.5],
        [-width / 2 + 0.5, depth / 2 - 0.5],
        [width / 2 - 0.5, depth / 2 - 0.5],
      ].map(([x, z], i) => (
        <mesh key={`pole-${i}`} position={[x, wallHeight / 2, z]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, wallHeight, 8]} />
          <primitive object={poleMaterial} />
        </mesh>
      ))}

      {/* Center pole (taller) */}
      <mesh position={[0, (wallHeight + height) / 2 - 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, height + 3, 8]} />
        <primitive object={poleMaterial} />
      </mesh>

      {/* Tent roof - pyramid shape */}
      <mesh position={[0, wallHeight + (height - wallHeight) / 2, 0]} castShadow>
        <coneGeometry args={[Math.max(width, depth) * 0.75, height - wallHeight + 1, 4]} />
        <primitive object={canvasMaterial} />
      </mesh>

      {/* Side walls (transparent panels) */}
      <mesh position={[0, wallHeight / 2, -depth / 2]}>
        <planeGeometry args={[width, wallHeight]} />
        <meshStandardMaterial color="#f5f5f0" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, wallHeight / 2, depth / 2]}>
        <planeGeometry args={[width, wallHeight]} />
        <meshStandardMaterial color="#f5f5f0" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-width / 2, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, wallHeight]} />
        <meshStandardMaterial color="#f5f5f0" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[width / 2, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, wallHeight]} />
        <meshStandardMaterial color="#f5f5f0" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Chiavari chair component
const ChiavariChair3D: React.FC<{ position: [number, number, number]; rotation?: number }> = ({
  position,
  rotation = 0,
}) => {
  const woodColor = '#f5f5f0'; // White chiavari
  const seatHeight = 1.5;
  const backHeight = 3;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, seatHeight, 0]} castShadow>
        <boxGeometry args={[1.3, 0.15, 1.3]} />
        <meshStandardMaterial color={woodColor} />
      </mesh>

      {/* Legs */}
      {[
        [-0.5, -0.5],
        [0.5, -0.5],
        [-0.5, 0.5],
        [0.5, 0.5],
      ].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, seatHeight / 2, z]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, seatHeight, 8]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
      ))}

      {/* Back frame */}
      <mesh position={[0, seatHeight + backHeight / 2, -0.55]} castShadow>
        <boxGeometry args={[1.2, backHeight, 0.1]} />
        <meshStandardMaterial color={woodColor} />
      </mesh>

      {/* Back slats (chiavari style) */}
      {[-0.35, 0, 0.35].map((x, i) => (
        <mesh key={`slat-${i}`} position={[x, seatHeight + backHeight / 2, -0.5]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, backHeight - 0.5, 8]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
      ))}
    </group>
  );
};

// Round table component
const RoundTable3D: React.FC<{ item: CanvasItemType }> = ({ item }) => {
  const def = ITEM_DEFINITIONS[item.type];
  const pos = canvasTo3D(item.position.x, item.position.y);
  const diameter = def.diameterFt || 5;
  const tableHeight = 2.5;
  const radius = diameter / 2;

  // Generate chair positions around the table
  const chairCount = item.chairCount || 0;
  const chairs = useMemo(() => {
    const result = [];
    const chairDistance = radius + 1.2;
    for (let i = 0; i < chairCount; i++) {
      const angle = (2 * Math.PI * i) / chairCount - Math.PI / 2;
      const x = chairDistance * Math.cos(angle);
      const z = chairDistance * Math.sin(angle);
      result.push({ x, z, rotation: angle + Math.PI / 2 });
    }
    return result;
  }, [chairCount, radius]);

  return (
    <group position={[pos.x, 0, pos.z]} rotation={[0, (item.rotation * Math.PI) / 180, 0]}>
      {/* Tablecloth (slightly larger than table) */}
      <mesh position={[0, tableHeight - 0.05, 0]} castShadow>
        <cylinderGeometry args={[radius + 0.3, radius + 0.8, tableHeight * 0.7, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Table top */}
      <mesh position={[0, tableHeight, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.1, 32]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>

      {/* Chairs around table */}
      {chairs.map((chair, i) => (
        <ChiavariChair3D
          key={`chair-${i}`}
          position={[chair.x, 0, chair.z]}
          rotation={chair.rotation}
        />
      ))}
    </group>
  );
};

// Rectangular table component
const RectTable3D: React.FC<{ item: CanvasItemType }> = ({ item }) => {
  const def = ITEM_DEFINITIONS[item.type];
  const pos = canvasTo3D(item.position.x, item.position.y);
  const width = def.widthFt || 6;
  const depth = def.heightFt || 2.5;
  const tableHeight = 2.5;

  // Generate chair positions around the table
  const chairCount = item.chairCount || 0;
  const chairs = useMemo(() => {
    const result: { x: number; z: number; rotation: number }[] = [];
    if (chairCount === 0) return result;

    // Distribute chairs: prioritize long sides, then ends
    const longSideChairs = Math.floor((chairCount - 2) / 2);
    const endChairs = chairCount > 2 ? 2 : chairCount;
    const topChairs = Math.ceil(longSideChairs / 2);
    const bottomChairs = Math.floor(longSideChairs / 2);

    // Top side
    for (let i = 0; i < topChairs; i++) {
      const spacing = width / (topChairs + 1);
      result.push({
        x: -width / 2 + spacing * (i + 1),
        z: -depth / 2 - 1.2,
        rotation: 0,
      });
    }

    // Bottom side
    for (let i = 0; i < bottomChairs; i++) {
      const spacing = width / (bottomChairs + 1);
      result.push({
        x: -width / 2 + spacing * (i + 1),
        z: depth / 2 + 1.2,
        rotation: Math.PI,
      });
    }

    // End chairs
    if (endChairs >= 1) {
      result.push({ x: width / 2 + 1.2, z: 0, rotation: -Math.PI / 2 });
    }
    if (endChairs >= 2) {
      result.push({ x: -width / 2 - 1.2, z: 0, rotation: Math.PI / 2 });
    }

    return result.slice(0, chairCount);
  }, [chairCount, width, depth]);

  return (
    <group position={[pos.x + width / 2, 0, pos.z + depth / 2]} rotation={[0, (item.rotation * Math.PI) / 180, 0]}>
      {/* Tablecloth */}
      <mesh position={[0, tableHeight - 0.05, 0]} castShadow>
        <boxGeometry args={[width + 0.4, tableHeight * 0.6, depth + 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Table top */}
      <mesh position={[0, tableHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>

      {/* Chairs */}
      {chairs.map((chair, i) => (
        <ChiavariChair3D
          key={`chair-${i}`}
          position={[chair.x, 0, chair.z]}
          rotation={chair.rotation}
        />
      ))}
    </group>
  );
};

// Dance floor component
const DanceFloor3D: React.FC<{ item: CanvasItemType }> = ({ item }) => {
  const def = ITEM_DEFINITIONS[item.type];
  const pos = canvasTo3D(item.position.x, item.position.y);
  const width = def.widthFt || 4;
  const depth = def.heightFt || 4;

  const isWhite = item.type.includes('white');
  const isBlack = item.type.includes('black');
  const baseColor = isWhite ? '#f0f0f0' : isBlack ? '#1a1a1a' : '#f0f0f0';

  return (
    <group position={[pos.x + width / 2, 0.05, pos.z + depth / 2]} rotation={[0, (item.rotation * Math.PI) / 180, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={baseColor} metalness={0.3} roughness={0.2} />
      </mesh>
    </group>
  );
};

// DJ Booth component
const DJBooth3D: React.FC<{ item: CanvasItemType }> = ({ item }) => {
  const def = ITEM_DEFINITIONS[item.type];
  const pos = canvasTo3D(item.position.x, item.position.y);
  const width = def.widthFt || 8;
  const depth = def.heightFt || 4;

  return (
    <group position={[pos.x + width / 2, 0, pos.z + depth / 2]} rotation={[0, (item.rotation * Math.PI) / 180, 0]}>
      {/* DJ Table */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Front panel */}
      <mesh position={[0, 1.25, depth / 2 - 0.1]} castShadow>
        <boxGeometry args={[width, 2.5, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Equipment on table */}
      <mesh position={[-1.5, 2.8, 0]} castShadow>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[1.5, 2.8, 0]} castShadow>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 1]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  );
};

// Bar component
const Bar3D: React.FC<{ item: CanvasItemType }> = ({ item }) => {
  const def = ITEM_DEFINITIONS[item.type];
  const pos = canvasTo3D(item.position.x, item.position.y);
  const width = def.widthFt || 8;
  const depth = def.heightFt || 3;

  return (
    <group position={[pos.x + width / 2, 0, pos.z + depth / 2]} rotation={[0, (item.rotation * Math.PI) / 180, 0]}>
      {/* Bar counter */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[width, 0.2, depth]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>
      {/* Bar front */}
      <mesh position={[0, 1.75, depth / 2 - 0.2]} castShadow>
        <boxGeometry args={[width, 3.5, 0.4]} />
        <meshStandardMaterial color="#3d2817" />
      </mesh>
      {/* Shelving back */}
      <mesh position={[0, 2.5, -depth / 2 + 0.2]} castShadow>
        <boxGeometry args={[width - 0.5, 5, 0.3]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
    </group>
  );
};

// Buffet component
const Buffet3D: React.FC<{ item: CanvasItemType }> = ({ item }) => {
  const def = ITEM_DEFINITIONS[item.type];
  const pos = canvasTo3D(item.position.x, item.position.y);
  const width = def.widthFt || 12;
  const depth = def.heightFt || 3;

  return (
    <group position={[pos.x + width / 2, 0, pos.z + depth / 2]} rotation={[0, (item.rotation * Math.PI) / 180, 0]}>
      {/* Tablecloth */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[width + 0.4, 2.4, depth + 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Table top */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      {/* Chafing dishes */}
      {[-3, -1, 1, 3].map((x, i) => (
        <mesh key={`dish-${i}`} position={[x, 2.8, 0]} castShadow>
          <boxGeometry args={[1.5, 0.5, 1.2]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Standalone chair component
const StandaloneChair3D: React.FC<{ item: CanvasItemType }> = ({ item }) => {
  const pos = canvasTo3D(item.position.x, item.position.y);
  return (
    <ChiavariChair3D
      position={[pos.x, 0, pos.z]}
      rotation={(item.rotation * Math.PI) / 180}
    />
  );
};

// Item renderer - determines which 3D component to use
const Item3D: React.FC<{ item: CanvasItemType }> = ({ item }) => {
  const type = item.type;

  if (type.startsWith('tent-')) {
    return <Tent3D item={item} />;
  }
  if (type === 'table-round-5ft') {
    return <RoundTable3D item={item} />;
  }
  if (type.startsWith('table-rect-')) {
    return <RectTable3D item={item} />;
  }
  if (type.startsWith('dance-floor-')) {
    return <DanceFloor3D item={item} />;
  }
  if (type === 'dj-booth') {
    return <DJBooth3D item={item} />;
  }
  if (type === 'bar') {
    return <Bar3D item={item} />;
  }
  if (type === 'buffet') {
    return <Buffet3D item={item} />;
  }
  if (type.startsWith('chair-')) {
    return <StandaloneChair3D item={item} />;
  }

  return null;
};

// Camera that can optionally auto-rotate
const CameraController: React.FC = () => {
  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={10}
      maxDistance={200}
      maxPolarAngle={Math.PI / 2 - 0.1}
      target={[0, 0, 0]}
    />
  );
};

// Main 3D Canvas component
export const Canvas3D: React.FC = () => {
  const { items } = useAppStore();

  return (
    <div className="w-full h-full bg-sky-200">
      <Canvas
        shadows
        camera={{ position: [50, 40, 50], fov: 60 }}
        gl={{ antialias: true }}
      >
        {/* Sky */}
        <Sky sunPosition={[100, 100, 20]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={200}
          shadow-camera-left={-150}
          shadow-camera-right={150}
          shadow-camera-top={150}
          shadow-camera-bottom={-150}
        />

        {/* Ground */}
        <Ground />

        {/* Grid helper */}
        <Grid
          position={[0, 0.01, 0]}
          args={[300, 300]}
          cellSize={10}
          cellThickness={0.5}
          cellColor="#ffffff"
          sectionSize={50}
          sectionThickness={1}
          sectionColor="#ffffff"
          fadeDistance={400}
          fadeStrength={1}
          followCamera={false}
        />

        {/* Render all items */}
        {items.map((item) => (
          <Item3D key={item.id} item={item} />
        ))}

        {/* Camera controls */}
        <CameraController />
      </Canvas>

      {/* 3D View Label */}
      <div className="absolute top-4 left-4 bg-brand-green/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span className="font-semibold">3D WALKTHROUGH</span>
        <span className="text-xs opacity-75">Pan • Rotate • Zoom</span>
      </div>
    </div>
  );
};
