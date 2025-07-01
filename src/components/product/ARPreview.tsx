import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ARPreviewProps {
  modelUrl: string;
  productName: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function ARPreview({ modelUrl, productName }: ARPreviewProps) {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if WebXR is supported
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported('immersive-ar')
        .then((supported: boolean) => setIsARSupported(supported))
        .catch(() => setIsARSupported(false));
    }
    setIsLoading(false);
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="h-[400px] relative rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <Model url={modelUrl} />
          <OrbitControls />
        </Canvas>
      </div>
      
      {isARSupported && (
        <Button 
          className="w-full"
          onClick={() => {
            // Launch AR experience
            // Implementation will vary based on WebXR/AR.js/8th Wall
          }}
        >
          View in Your Space
        </Button>
      )}
    </Card>
  );
}