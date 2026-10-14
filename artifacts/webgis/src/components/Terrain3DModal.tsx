import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./Terrain3DModal.css";

interface Props {
  open: boolean;
  onClose: () => void;
  basePath?: string;
}

const GRID_WIDTH = 80;
const GRID_HEIGHT = 64;
const TERRAIN_WIDTH = 12;
const TERRAIN_DEPTH = 9;

export default function Terrain3DModal({ open, onClose, basePath = "" }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#101923");
    scene.fog = new THREE.Fog("#101923", 18, 36);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(10, 8, 12);
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.minDistance = 6;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI * 0.48;

    scene.add(new THREE.HemisphereLight("#dbeafe", "#172554", 2.2));
    const sun = new THREE.DirectionalLight("#fff7ed", 3.2);
    sun.position.set(-8, 14, 10);
    sun.castShadow = true;
    scene.add(sun);

    const plane = new THREE.PlaneGeometry(TERRAIN_WIDTH, TERRAIN_DEPTH, GRID_WIDTH - 1, GRID_HEIGHT - 1);
    const position = plane.attributes.position;
    const colors = new Float32Array(position.count * 3);
    const color = new THREE.Color();
    for (let i = 0; i < position.count; i++) {
      color.setHSL(0.28 - (i / position.count) * 0.16, 0.55, 0.3 + (i / position.count) * 0.2);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    plane.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0.02, side: THREE.DoubleSide });
    const terrain = new THREE.Mesh(plane, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    scene.add(terrain);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(plane),
      new THREE.LineBasicMaterial({ color: "#93c5fd", transparent: true, opacity: 0.12 })
    );
    wire.rotation.copy(terrain.rotation);
    scene.add(wire);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(22, 64),
      new THREE.MeshStandardMaterial({ color: "#0b1320", roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    let animationFrame = 0;
    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let disposed = false;
    const loadElevation = async () => {
      try {
        const response = await fetch(`${basePath}/data/raster/.elev-cache.json`);
        if (!response.ok) return;
        const cache = await response.json() as { data?: number[]; w?: number; h?: number };
        if (disposed || !cache.data || cache.data.length < GRID_WIDTH * GRID_HEIGHT) return;
        const values = cache.data;
        let min = Infinity;
        let max = -Infinity;
        values.forEach(value => { min = Math.min(min, value); max = Math.max(max, value); });
        for (let i = 0; i < position.count; i++) {
          const value = values[i] || 0;
          const normalized = (value - min) / Math.max(1, max - min);
          position.setZ(i, normalized * 2.6);
          color.setHSL(0.28 - normalized * 0.2, 0.6, 0.28 + normalized * 0.25);
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }
        position.needsUpdate = true;
        plane.attributes.color.needsUpdate = true;
        plane.computeVertexNormals();
        wire.geometry.dispose();
        wire.geometry = new THREE.WireframeGeometry(plane);
      } catch {
        // Keep the shaded placeholder terrain when the cache is unavailable.
      }
    };
    void loadElevation();

    const animate = () => {
      if (disposed) return;
      animationFrame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      controls.dispose();
      plane.dispose();
      material.dispose();
      wire.geometry.dispose();
      (wire.material as THREE.Material).dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [open, basePath]);

  if (!open) return null;
  return (
    <div className="terrain3d-overlay" role="dialog" aria-label="Địa hình 3D">
      <div className="terrain3d-panel">
        <div className="terrain3d-header">
          <div>
            <strong>Địa hình 3D Sơn La</strong>
            <span>Xoay, nghiêng và phóng to bằng chuột</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng địa hình 3D">✕</button>
        </div>
        <div ref={mountRef} className="terrain3d-canvas" />
      </div>
    </div>
  );
}
