import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

/**
 * NebulaBackground
 * ================
 * Just keeps the background a nice deep black.
 */
function NebulaBackground() {
  useFrame((state) => {
    state.scene.background = new THREE.Color(0x000000);
  });
  return null;
}

/**
 * GLBAvatar
 * =========
 * This is the 3D character (xbot.glb) that you see on the screen.
 * It loads the mesh and plays animations for the signs.
 */
export function GLBAvatar({
  activeSign,
  onSignComplete,
  speed = 1,
}: {
  activeSign: string | null;
  onSignComplete?: () => void;
  speed?: number;
}) {
  const groupRef     = useRef<THREE.Group>(null);
  const mixerRef     = useRef<THREE.AnimationMixer | null>(null);
  const actionRef    = useRef<THREE.AnimationAction | null>(null);
  const completedRef = useRef(false);
  const idleReady    = useRef(false);

  // Load the 3D xbot model from the public folder
  const gltf = useLoader(GLTFLoader, '/xbot.glb');

  // Setup materials and make sure the model is visible
  useEffect(() => {
    if (!gltf?.scene) return;
    gltf.scene.traverse((obj: any) => {
      obj.frustumCulled = false;
      if (obj.isMesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => { m.side = THREE.DoubleSide; });
        } else {
          obj.material.side = THREE.DoubleSide;
        }
      }
    });
    console.log("[SunSign] 3D Avatar Ready!");
  }, [gltf]);

  const onCompleteRef = useRef(onSignComplete);
  useEffect(() => { onCompleteRef.current = onSignComplete; }, [onSignComplete]);

  // -- Cache Bones for Idle Pose --
  // We MUST cache these instead of searching for them every frame in the render loop,
  // otherwise we traverse the entire mesh hundreds of times a second and crash performance!
  const bonesRef = useRef<{ lArm: THREE.Bone | null; rArm: THREE.Bone | null; lHand: THREE.Bone | null; rHand: THREE.Bone | null }>({
    lArm: null, rArm: null, lHand: null, rHand: null
  });

  useEffect(() => {
    if (!gltf?.scene) return;
    const findBone = (name: string): THREE.Bone | null => {
      let result: THREE.Bone | null = null;
      gltf.scene.traverse((obj: any) => {
        if (obj.isBone && obj.name === name) result = obj;
      });
      return result;
    };
    bonesRef.current = {
      lArm: findBone('mixamorigLeftArm'),
      rArm: findBone('mixamorigRightArm'),
      lHand: findBone('mixamorigLeftHand'),
      rHand: findBone('mixamorigRightHand'),
    };
  }, [gltf]);

  // -- Animation Player --
  // This effect runs every time a new word (sign) is picked.
  useEffect(() => {
    if (!gltf?.scene) return;

    if (!activeSign) {
      // If nothing is playing, stop all animations
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current.uncacheRoot(gltf.scene);
      }
      actionRef.current = null;
      return;
    }

    // Clean up the previous animation to keep the memory clean
    if (mixerRef.current) {
      mixerRef.current.stopAllAction();
      mixerRef.current.uncacheRoot(gltf.scene);
    }
    
    completedRef.current = false;
    
    // If it's a space (pause), just wait a moment
    if (activeSign === ' ') {
      actionRef.current = null;
      const timer = setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
      }, 600 / speed);
      return () => clearTimeout(timer);
    }

    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixerRef.current = mixer;

    const ctrl  = new AbortController();
    const fetchTimer = setTimeout(() => ctrl.abort(), 5000);

    // Clean up the name for the file search (e.g. "Good Bye" -> "Good_Bye")
    const safe      = activeSign.replace(/ /g, '_');
    const safeLower = safe.toLowerCase();
    const candidates = safe === safeLower ? [safe] : [safe, safeLower];

    // Helper to find the .json file on the server
    const tryFetch = (names: string[]): Promise<any> => {
      const [first, ...rest] = names;
      return fetch(`/animations/sign_clips/${encodeURIComponent(first)}.json`, {
        signal: ctrl.signal,
      }).then(r => {
        if (r.ok) return r.json();
        if (rest.length > 0) return tryFetch(rest);
        throw new Error(`Not found: ${first}`);
      });
    };

    // Go get the animation file!
    tryFetch(candidates)
      .then((json: any) => {
        const clip = THREE.AnimationClip.parse(json);
        const newAction = mixer.clipAction(clip);
        newAction.clampWhenFinished = true; // Stay in the last pose when done
        newAction.loop              = THREE.LoopOnce;
        newAction.timeScale         = speed;

        newAction.play();
        actionRef.current = newAction;

        // When the animation finishes, let the playlist know
        const onFinished = (e: any) => {
          if (e.action === newAction && !completedRef.current) {
            completedRef.current = true;
            onCompleteRef.current?.();
          }
        };
        mixer.addEventListener('finished', onFinished);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.warn(`[SunSign] No sign found for "${activeSign}"`);
        
        actionRef.current = null;
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
      })
      .finally(() => clearTimeout(fetchTimer));

    return () => {
      clearTimeout(fetchTimer);
      ctrl.abort();
      mixer.stopAllAction();
      mixer.uncacheRoot(gltf.scene);
    };
  }, [activeSign, speed, gltf]);

  // -- Main Screen Loop --
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    
    if (groupRef.current) {
      // Make the avatar slowly breathe/float
      groupRef.current.position.y = Math.sin(t * 2) * 0.02 - 1.4;
      groupRef.current.scale.set(1.5, 1.5, 1.5);
    }

    mixerRef.current?.update(delta);

    // -- Idle Pose --
    // If no sign is playing, we want the arms to fall down naturally.
    // By default, the character starts in a 'T' pose (arms straight out).
    if (!actionRef.current && gltf?.scene) {
      const lerpSpeed = Math.min(1, 4 * delta); // How fast it moves to the idle pose
      
      const { lArm, rArm, lHand, rHand } = bonesRef.current;
      
      // Rotations to make the arms drop down
      const downLeft  = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -1.2));
      const downRight = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 1.2));
      const relaxHand = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
      
      // Slerp means "smoothly turn to this rotation"
      if (lArm)  lArm.quaternion.slerp(downLeft, lerpSpeed);
      if (rArm)  rArm.quaternion.slerp(downRight, lerpSpeed);
      if (lHand) lHand.quaternion.slerp(relaxHand, lerpSpeed);
      if (rHand) rHand.quaternion.slerp(relaxHand, lerpSpeed);
    }
  });

  return (
    <group ref={groupRef}>
      {gltf && <primitive object={gltf.scene} />}
    </group>
  );
}

/**
 * HandScene
 * =========
 * This is the main "stage" for the 3D character. It sets up 
 * the lighting and the camera.
 */
interface HandSceneProps {
  currentSignInfo: string | null;
  onSignComplete?: () => void;
  speed?: number;
}

export default function HandScene({
  currentSignInfo,
  onSignComplete,
  speed = 1,
}: HandSceneProps) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(255,238,2,0.10) 0%, #000000 60%)',
    }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 40 }}
        gl={{ alpha: false, antialias: false }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        onCreated={({ scene }) => { scene.background = new THREE.Color(0x000000); }}
      >
        <NebulaBackground />
        
        {/* Lights - so the character isn't just a shadow */}
        <ambientLight intensity={0.9} color="#ffffff" />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-4, 2, -4]} intensity={2.0} color="#FFEE02" />
        <pointLight position={[4, -3, 4]} intensity={1.0} color="#ffffff" />
        
        <GLBAvatar
          activeSign={currentSignInfo}
          onSignComplete={onSignComplete}
          speed={speed}
        />
        
        {/* Allows you to drag the character around slightly */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 2 - 0.2}
          target={[0, 0.2, 0]}
        />
      </Canvas>
    </div>
  );
}
