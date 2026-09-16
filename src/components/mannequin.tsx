import { GLView } from 'expo-gl';
import { useEffect, useMemo, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import * as THREE from 'three';

import { BodyProfile } from '@/context/fitting-context';
import { SKIN_TONES } from '@/data/demo';

type Props = {
  profile: BodyProfile;
  dressed?: boolean;
  angle?: number;
  onAngleChange: (value: number) => void;
  shirtColor?: string;
  pantsColor?: string;
  dark?: boolean;
};

type Materials = {
  skin: THREE.MeshPhysicalMaterial;
  top: THREE.MeshPhysicalMaterial;
  bottom: THREE.MeshPhysicalMaterial;
  shoe: THREE.MeshPhysicalMaterial;
};

const BUILD_SCALE: Record<string, number> = { Delgada: 0.86, Media: 1, 'Atlética': 1.1, Robusta: 1.22 };

function shapeKey(profile: BodyProfile) {
  return [profile.height, profile.weight, profile.build, profile.sex].join('|');
}

// Crea una cápsula orientada entre dos puntos cualesquiera (para brazos con
// codo doblado, en vez de solo cilindros verticales).
function capsuleBetween(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const length = Math.max(0.001, dir.length() - radius * 2);
  const geometry = new THREE.CapsuleGeometry(radius, length, 4, 14);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(a).add(dir.clone().multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return mesh;
}

// Maniquí liso y elegante, al estilo de los maniquíes de tienda: proporciones
// estilizadas, cabeza ovalada sin rasgos, acabado brillante y codos con una
// leve flexión relajada. Se reconstruye solo cuando cambian las medidas.
function buildBody(profile: BodyProfile, materials: Materials) {
  const group = new THREE.Group();
  const heightM = Math.max(1, profile.height / 100);
  const buildScale = BUILD_SCALE[profile.build] ?? 1;
  const weightScale = THREE.MathUtils.clamp(profile.weight / 70, 0.8, 1.4);
  const widthScale = buildScale * (0.72 + weightScale * 0.28);
  const shoulderScale = profile.sex === 'Hombre' ? 1.1 : profile.sex === 'Mujer' ? 0.92 : 1;

  // Proporciones un poco estilizadas (cabeza algo más pequeña, piernas más
  // largas), como las de un maniquí de aparador en vez de un promedio humano.
  const footH = heightM * 0.032;
  const legLen = heightM * 0.5;
  const hipH = heightM * 0.05;
  const torsoH = heightM * 0.28;
  const neckH = heightM * 0.04;
  const headR = heightM * 0.053;
  const upperArmLen = heightM * 0.175;
  const forearmLen = heightM * 0.16;

  const hipHalfW = heightM * 0.088 * widthScale;
  const shoulderHalfW = heightM * 0.12 * widthScale * shoulderScale;
  const legR = heightM * 0.038 * widthScale;
  const armR = heightM * 0.026 * widthScale;
  const forearmR = armR * 0.86;
  const torsoDepth = heightM * 0.115 * widthScale;

  let y = footH * 0.6;

  // Piernas + pies (óvalos achatados en vez de cajas, para que no se vean
  // como bloques).
  const legGeo = new THREE.CapsuleGeometry(legR, Math.max(0.02, legLen - legR * 2), 4, 14);
  [-1, 1].forEach((side) => {
    const leg = new THREE.Mesh(legGeo, materials.bottom);
    leg.position.set(side * hipHalfW * 0.5, y + legLen / 2, 0);
    leg.userData.role = 'bottom';
    group.add(leg);

    const foot = new THREE.Mesh(new THREE.SphereGeometry(legR * 1.15, 14, 10), materials.shoe);
    foot.scale.set(1, 0.52, 2.1);
    foot.position.set(side * hipHalfW * 0.5, footH * 0.55, heightM * 0.045);
    foot.userData.role = 'shoes';
    group.add(foot);
  });
  y += legLen;

  // Cadera (cilindro suave que conecta piernas y torso).
  const hip = new THREE.Mesh(new THREE.CylinderGeometry(hipHalfW, hipHalfW * 0.94, hipH, 20), materials.bottom);
  hip.position.set(0, y + hipH / 2, 0);
  hip.userData.role = 'bottom';
  group.add(hip);
  y += hipH;

  // Torso con leve entalle en la cintura.
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(shoulderHalfW, hipHalfW * 0.98, torsoH, 24),
    materials.top
  );
  torso.scale.z = torsoDepth / shoulderHalfW;
  torso.position.set(0, y + torsoH / 2, 0);
  torso.userData.role = 'top';
  group.add(torso);
  const shoulderY = y + torsoH;
  y = shoulderY;

  // Brazos con el codo levemente doblado (pose relajada, como los maniquíes
  // de la referencia), en vez de un tubo recto pegado al cuerpo.
  [-1, 1].forEach((side) => {
    const shoulder = new THREE.Vector3(side * shoulderHalfW * 0.92, shoulderY - heightM * 0.015, heightM * 0.005);
    const elbow = new THREE.Vector3(side * (shoulderHalfW * 1.06), shoulderY - upperArmLen, heightM * 0.025);
    const wrist = new THREE.Vector3(side * (shoulderHalfW * 0.7), shoulderY - upperArmLen - forearmLen, heightM * 0.055);

    const upperArm = capsuleBetween(shoulder, elbow, armR, materials.top);
    upperArm.userData.role = 'top';
    group.add(upperArm);

    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(armR * 0.95, 12, 10), materials.top);
    elbowJoint.position.copy(elbow);
    elbowJoint.userData.role = 'top';
    group.add(elbowJoint);

    const forearm = capsuleBetween(elbow, wrist, forearmR, materials.skin);
    forearm.userData.role = 'skin';
    group.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(forearmR * 1.35, 12, 10), materials.skin);
    hand.scale.set(0.85, 1.15, 0.6);
    hand.position.copy(wrist).add(new THREE.Vector3(0, -forearmR * 1.1, heightM * 0.01));
    hand.userData.role = 'skin';
    group.add(hand);
  });

  // Cuello y cabeza ovalada sin rasgos, como los maniquíes de aparador.
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(headR * 0.4, headR * 0.46, neckH, 16), materials.skin);
  neck.position.set(0, y + neckH / 2, 0);
  neck.userData.role = 'skin';
  group.add(neck);
  y += neckH;

  const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 24, 20), materials.skin);
  head.scale.set(0.9, 1.18, 0.94);
  head.position.set(0, y + headR * 1.05, heightM * 0.005);
  head.userData.role = 'skin';
  group.add(head);
  y += headR * 2.2;

  // Sombra de contacto en el piso.
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(hipHalfW * 2.4, 28),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.001;
  group.add(shadow);

  return { group, totalHeight: y };
}

export function Mannequin({
  profile,
  dressed = false,
  angle = 0,
  onAngleChange,
  shirtColor = '#89A5B9',
  pantsColor = '#B6A080',
  dark = false,
}: Props) {
  const stateRef = useRef({ profile, dressed, angle, shirtColor, pantsColor, dark });
  stateRef.current = { profile, dressed, angle, shirtColor, pantsColor, dark };

  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const origin = useRef(0);
  const currentAngle = useRef(angle);
  currentAngle.current = angle;
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          origin.current = currentAngle.current;
        },
        onPanResponderMove: (_, gesture) => onAngleChange(((origin.current + gesture.dx * 0.6) % 360 + 360) % 360),
      }),
    [onAngleChange]
  );

  const onContextCreate = async (gl: WebGL2RenderingContext & { endFrameEXP: () => void }) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    // three.js intenta crear su propio <canvas> llamando a `document` cuando no
    // le pasamos uno explícito (para poder exponer `renderer.domElement`). React
    // Native no tiene `document`, así que eso revienta con
    // "ReferenceError: Property 'document' doesn't exist". Le damos un objeto
    // canvas de mentira con lo mínimo que WebGLRenderer necesita, para que nunca
    // intente tocar el DOM real.
    const fakeCanvas = {
      width,
      height,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      clientWidth: width,
      clientHeight: height,
      getContext: () => gl,
    } as unknown as HTMLCanvasElement;

    const renderer = new THREE.WebGLRenderer({
      context: gl as unknown as WebGLRenderingContext,
      canvas: fakeCanvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    if ('outputColorSpace' in renderer) {
      (renderer as unknown as { outputColorSpace: string }).outputColorSpace = THREE.SRGBColorSpace;
    }

    const scene = new THREE.Scene();
    const heightM = Math.max(1, stateRef.current.profile.height / 100);

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50);
    camera.position.set(0, heightM * 0.55, heightM * 2.5);
    camera.lookAt(0, heightM * 0.52, 0);

    // Iluminación de estudio (tres puntos) para el look pulido y brillante.
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(2.2, 4, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-2.8, 1.2, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.55);
    rim.position.set(0, 3, -3);
    scene.add(rim);

    const materialOptions = { roughness: 0.3, metalness: 0.06, clearcoat: 0.55, clearcoatRoughness: 0.18 };
    const materials: Materials = {
      skin: new THREE.MeshPhysicalMaterial({ ...materialOptions }),
      top: new THREE.MeshPhysicalMaterial({ ...materialOptions }),
      bottom: new THREE.MeshPhysicalMaterial({ ...materialOptions }),
      shoe: new THREE.MeshPhysicalMaterial({ ...materialOptions, roughness: 0.22 }),
    };

    let built = buildBody(stateRef.current.profile, materials);
    scene.add(built.group);
    let builtKey = shapeKey(stateRef.current.profile);

    const applyMaterials = () => {
      const s = stateRef.current;
      const skin = new THREE.Color(SKIN_TONES[s.profile.skin] ?? SKIN_TONES[2]);
      materials.skin.color.copy(skin);
      materials.top.color.copy(s.dressed ? new THREE.Color(s.shirtColor) : skin);
      materials.bottom.color.copy(s.dressed ? new THREE.Color(s.pantsColor) : skin);
      materials.shoe.color.copy(new THREE.Color(s.dressed ? '#4A3628' : '#2B2E30'));
    };

    const bgLight = new THREE.Color('#E6EAEC');
    const bgDark = new THREE.Color('#0E1E2B');

    const renderLoop = () => {
      if (!mountedRef.current) return;
      const s = stateRef.current;

      const key = shapeKey(s.profile);
      if (key !== builtKey) {
        scene.remove(built.group);
        built.group.traverse((obj: THREE.Object3D) => {
          if (obj instanceof THREE.Mesh) obj.geometry.dispose();
        });
        built = buildBody(s.profile, materials);
        scene.add(built.group);
        builtKey = key;
        const h = Math.max(1, s.profile.height / 100);
        camera.position.set(0, h * 0.55, h * 2.5);
        camera.lookAt(0, h * 0.52, 0);
      }

      applyMaterials();
      built.group.rotation.y = (s.angle * Math.PI) / 180;
      scene.background = s.dark ? bgDark : bgLight;

      renderer.render(scene, camera);
      gl.endFrameEXP();
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  };

  return (
    <View
      {...responder.panHandlers}
      style={{ flex: 1, minHeight: 160, width: '100%' }}
      accessibilityLabel={
        'Maniquí 3D, ' +
        profile.height +
        ' centímetros, girado ' +
        Math.round(angle) +
        ' grados'
      }>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}
