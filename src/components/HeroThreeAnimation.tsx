import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroThreeAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Color palette: Black, Titanium, White
  const COLORS = {
    background: 0x0a0a0c,      // Near black
    titanium: 0x8a8a9a,        // Titanium metallic
    titaniumLight: 0xb0b0c0,   // Light titanium
    titaniumDark: 0x5a5a6a,    // Dark titanium
    white: 0xffffff,           // Pure white
    whiteSoft: 0xe8e8f0,       // Soft white
    accent: 0x8a8a9a,          // Titanium accent
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 40);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(COLORS.background, 1);
    container.appendChild(renderer.domElement);

    // ===== MATERIALS =====
    const titaniumMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.titanium,
      metalness: 0.85,
      roughness: 0.25,
      envMapIntensity: 1.2,
    });

    const titaniumLightMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.titaniumLight,
      metalness: 0.75,
      roughness: 0.35,
      envMapIntensity: 1,
    });

    const titaniumDarkMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.titaniumDark,
      metalness: 0.9,
      roughness: 0.15,
      envMapIntensity: 1.5,
    });

    const whiteMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.white,
      metalness: 0.1,
      roughness: 0.9,
      emissive: new THREE.Color(0x222233),
      emissiveIntensity: 0.3,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.titanium,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.titaniumLight,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });

    // ===== LIGHTING =====
    const ambientLight = new THREE.AmbientLight(COLORS.whiteSoft, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(COLORS.white, 1.2);
    keyLight.position.set(10, 15, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(COLORS.titaniumLight, 0.5);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(COLORS.white, 0.8);
    rimLight.position.set(0, -10, 5);
    scene.add(rimLight);

    const pointLight = new THREE.PointLight(COLORS.titanium, 0.6, 50);
    pointLight.position.set(0, 0, 20);
    scene.add(pointLight);

    // ===== GEOMETRY: Floating Titanium Structures =====
    const structures: THREE.Mesh[] = [];
    const wireframes: THREE.Mesh[] = [];
    const glows: THREE.Mesh[] = [];

    // Create multiple geometric forms
    const geometries = [
      // Octahedron (diamond-like)
      new THREE.OctahedronGeometry(3, 0),
      // Icosahedron (more spherical)
      new THREE.IcosahedronGeometry(2.5, 0),
      // Box with rounded edges (simulated)
      new THREE.BoxGeometry(3, 3, 3, 2, 2, 2),
      // Tetrahedron
      new THREE.TetrahedronGeometry(2.8, 0),
      // Dodecahedron
      new THREE.DodecahedronGeometry(2.7, 0),
    ];

    const positions = [
      new THREE.Vector3(-12, 2, -5),
      new THREE.Vector3(12, -1, -8),
      new THREE.Vector3(-6, -3, -12),
      new THREE.Vector3(8, 4, -6),
      new THREE.Vector3(0, 5, -15),
    ];

    const rotations = [
      new THREE.Euler(0.5, 0.3, 0.2),
      new THREE.Euler(-0.3, 0.7, -0.4),
      new THREE.Euler(0.8, -0.5, 0.3),
      new THREE.Euler(-0.6, -0.2, 0.6),
      new THREE.Euler(0.2, 0.9, -0.3),
    ];

    const materials = [
      titaniumMaterial,
      titaniumLightMaterial,
      titaniumDarkMaterial,
      titaniumMaterial,
      titaniumLightMaterial,
    ];

    geometries.forEach((geometry, i) => {
      // Main mesh
      const mesh = new THREE.Mesh(geometry, materials[i]);
      mesh.position.copy(positions[i]);
      mesh.rotation.copy(rotations[i]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      structures.push(mesh);

      // Wireframe overlay
      const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
      wireframe.position.copy(positions[i]);
      wireframe.rotation.copy(rotations[i]);
      wireframe.scale.multiplyScalar(1.02);
      scene.add(wireframe);
      wireframes.push(wireframe);

      // Glow shell
      const glow = new THREE.Mesh(geometry, glowMaterial);
      glow.position.copy(positions[i]);
      glow.rotation.copy(rotations[i]);
      glow.scale.multiplyScalar(1.15);
      scene.add(glow);
      glows.push(glow);
    });

    // ===== PARTICLE FIELD =====
    const particleCount = 1500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleAlphas = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      particleSizes[i] = 0.5 + Math.random() * 1.5;
      particleAlphas[i] = 0.1 + Math.random() * 0.4;

      // Titanium/white color variation
      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        // Titanium
        particleColors[i * 3] = 0.54;
        particleColors[i * 3 + 1] = 0.54;
        particleColors[i * 3 + 2] = 0.6;
      } else if (colorChoice < 0.8) {
        // Light titanium
        particleColors[i * 3] = 0.69;
        particleColors[i * 3 + 1] = 0.69;
        particleColors[i * 3 + 2] = 0.75;
      } else {
        // White
        particleColors[i * 3] = 1;
        particleColors[i * 3 + 1] = 1;
        particleColors[i * 3 + 2] = 1;
      }
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute('alpha', new THREE.BufferAttribute(particleAlphas, 1));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ===== RING STRUCTURE =====
    const ringGeometry = new THREE.RingGeometry(18, 20, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: COLORS.titanium,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);

    const ring2Geometry = new THREE.RingGeometry(22, 22.5, 64);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: COLORS.titaniumLight,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.08,
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = -Math.PI / 2;
    scene.add(ring2);

    // ===== LINE GRID (Titanium) =====
    const gridSize = 60;
    const gridDivisions = 30;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, COLORS.titaniumDark, COLORS.titaniumDark);
    gridHelper.position.y = -12;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.1;
    scene.add(gridHelper);

    // ===== ANIMATION =====
    let time = 0;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      time += 0.008;

      // Animate structures
      structures.forEach((mesh, i) => {
        const baseRot = rotations[i];
        mesh.rotation.x = baseRot.x + Math.sin(time * 0.7 + i) * 0.15;
        mesh.rotation.y = baseRot.y + Math.cos(time * 0.5 + i) * 0.2;
        mesh.rotation.z = baseRot.z + Math.sin(time * 0.3 + i) * 0.1;

        // Floating motion
        mesh.position.y = positions[i].y + Math.sin(time * 0.6 + i * 1.2) * 0.8;
        mesh.position.x = positions[i].x + Math.cos(time * 0.4 + i * 0.8) * 0.5;

        // Wireframe sync
        wireframes[i].rotation.copy(mesh.rotation);
        wireframes[i].position.copy(mesh.position);

        // Glow sync
        glows[i].rotation.copy(mesh.rotation);
        glows[i].position.copy(mesh.position);
        (glows[i].material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.sin(time * 2 + i) * 0.02;
      });

      // Animate particles
      const particlePos = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Slow orbital rotation
        const x = particlePos[i * 3];
        const y = particlePos[i * 3 + 1];
        const z = particlePos[i * 3 + 2];

        const r = Math.sqrt(x * x + z * z);
        if (r > 0) {
          const angle = time * 0.02 + i * 0.001;
          particlePos[i * 3] = (x * Math.cos(angle)) - (z * Math.sin(angle));
          particlePos[i * 3 + 2] = (x * Math.sin(angle)) + (z * Math.cos(angle));
        }

        // Vertical drift
        particlePos[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.003;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Rotate rings
      ring.rotation.z = time * 0.05;
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(time) * 0.04;
      ring2.rotation.z = -time * 0.03;
      (ring2.material as THREE.MeshBasicMaterial).opacity = 0.05 + Math.cos(time * 1.3) * 0.03;

      // Animate point light
      pointLight.position.x = Math.sin(time * 0.4) * 8;
      pointLight.position.y = Math.cos(time * 0.3) * 5;
      pointLight.intensity = 0.4 + Math.sin(time * 1.5) * 0.2;

      // Subtle camera movement
      camera.position.x = Math.sin(time * 0.1) * 1.5;
      camera.position.y = Math.cos(time * 0.08) * 1.5;
      camera.lookAt(0, 0, -5);

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);

      // Cleanup
      renderer.dispose();
      geometries.forEach(g => g.dispose());
      particleGeometry.dispose();
      ringGeometry.dispose();
      ring2Geometry.dispose();
      titaniumMaterial.dispose();
      titaniumLightMaterial.dispose();
      titaniumDarkMaterial.dispose();
      whiteMaterial.dispose();
      wireframeMaterial.dispose();
      glowMaterial.dispose();
      particleMaterial.dispose();
      ringMaterial.dispose();
      ring2Material.dispose();
      gridHelper.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};