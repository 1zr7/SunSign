import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

// ── Silence THREE.Clock deprecation ───────────────────────────────────────────
// three.js 0.174+ deprecated THREE.Clock in favour of THREE.Timer.
// @react-three/fiber still uses Clock internally (pre v9 update).
// We patch the warn function to suppress just this one specific
// message so the console stays clean without forking r3f.
{
  const _warn = THREE.WebGLRenderer.prototype.warn ?? console.warn;
  // THREE logs the deprecation through its internal warn() helper.
  // We intercept console.warn once at module load to filter it.
  const origWarn = console.warn.bind(console);
  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock') && args[0].includes('deprecated')) return;
    origWarn(...args);
  };
}

/**
 * NebulaBackground
 * ================
 * Sets the background colour once on mount — not every frame.
 * Allocating a new THREE.Color() inside useFrame() was creating
 * garbage every 16 ms; this version does it zero times per frame.
 */
function NebulaBackground() {
  useFrame(({ scene, invalidate }) => {
    if (!scene.background) {
      scene.background = new THREE.Color(0x000000);
      invalidate(); // Only re-render to apply the background
    }
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

  // -- Recolour avatar to SunSign palette (yellow + white) --
  // XBot (Mixamo) ships with two named materials:
  //   Alpha_Body_MAT   → main body/skin mesh
  //   Alpha_Joints_MAT → dark connector spheres between limbs
  // We clone each material before mutating so the GLTF cache stays clean.
  useEffect(() => {
    if (!gltf?.scene) return;

    const WHITE  = new THREE.Color(0xffffff);
    const YELLOW = new THREE.Color(0xFFEE02);

    gltf.scene.traverse((obj: any) => {
      obj.frustumCulled = false;

      if (!obj.isMesh || !obj.material) return;

      const applyMat = (mat: any): THREE.MeshStandardMaterial => {
        const m = mat.clone() as THREE.MeshStandardMaterial;
        m.map          = null; // drop original texture
        m.metalness    = 0.0;

        const name: string = (mat.name ?? '').toLowerCase();

        if (name.includes('joint')) {
          // Connector spheres → brand yellow
          m.color        = YELLOW.clone();
          m.emissive     = YELLOW.clone();
          m.emissiveIntensity = 0.25;
          m.roughness    = 0.4;
        } else {
          // Body / everything else → clean white with a warm glow
          m.color        = WHITE.clone();
          m.emissive     = YELLOW.clone();
          m.emissiveIntensity = 0.06;
          m.roughness    = 0.55;
        }

        m.side = THREE.DoubleSide;
        m.needsUpdate = true;
        return m;
      };

      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map(applyMat);
      } else {
        obj.material = applyMat(obj.material);
      }
    });

    console.log('[SunSign] 3D Avatar Ready!');
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
  // We use frameloop="demand" on the Canvas, so we must call
  // invalidate() ourselves whenever we change something visible.
  // We accumulate our own elapsed time to avoid THREE.Clock entirely.
  const elapsedRef = useRef(0);

  useFrame(({ invalidate }, delta) => {
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    let needsRender = false;

    if (groupRef.current) {
      // Make the avatar slowly breathe/float
      groupRef.current.position.y = Math.sin(t * 2) * 0.02 - 1.4;
      groupRef.current.scale.set(1.5, 1.5, 1.5);
      needsRender = true;
    }

    if (mixerRef.current) {
      mixerRef.current.update(delta);
      needsRender = true;
    }

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
      needsRender = true;
    }

    if (needsRender) invalidate();
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
  // ── WebGL Context Recovery ───────────────────────────────────────────────
  // MediaPipe Holistic steals a WebGL2 context on its first frame send.
  // @react-three/fiber has no built-in context-restore path, so we do a
  // full Canvas remount (by bumping `canvasKey`) after a short delay.
  // By then MediaPipe has already settled and the new context is stable.
  const [canvasKey,   setCanvasKey]   = useState(0);
  const [contextLost, setContextLost] = useState(false);
  const remountRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any pending remount timer on unmount
  useEffect(() => () => { if (remountRef.current) clearTimeout(remountRef.current); }, []);

  const handleContextLost = (e: Event) => {
    e.preventDefault(); // Must call this — otherwise the browser permanently destroys the context
    setContextLost(true);
    console.warn('[SunSign] WebGL context lost — remounting in 600 ms…');
    if (remountRef.current) clearTimeout(remountRef.current);
    remountRef.current = setTimeout(() => {
      setCanvasKey(k => k + 1); // New key → React fully unmounts + remounts the Canvas
      setContextLost(false);
    }, 600);
  };

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: 'radial-gradient(ellipse at 50% 30%, rgba(255,238,2,0.10) 0%, #000000 60%)',
    }}>
      {/* Brief shimmer shown during the 600 ms remount window */}
      {contextLost && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
        }}>
          <div style={{
            width: 32, height: 32,
            border: '2px solid rgba(255,238,2,0.3)',
            borderTopColor: '#FFEE02',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      <Canvas
        id="avatar-canvas"
        key={canvasKey}
        camera={{ position: [0, 0, 4.5], fov: 40 }}
        gl={{ alpha: false, antialias: false, preserveDrawingBuffer: true }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        frameloop="demand"
        onCreated={({ gl, scene }) => {
          scene.background = new THREE.Color(0x000000);
          // Attach context-loss handler to the real canvas DOM element
          gl.domElement.addEventListener('webglcontextlost', handleContextLost);
        }}
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

