"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    const width = currentMount.clientWidth || 480;
    const height = currentMount.clientHeight || 420;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, Math.max(width / Math.max(height, 1), 0.1), 0.1, 1000);
    camera.position.set(0, 1.2, 5.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      currentMount.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL not supported or context creation failed:", err);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffca29, 1.8);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x6da8dc, 1.2);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);

    const accentLight = new THREE.DirectionalLight(0xe1413d, 0.8);
    accentLight.position.set(0, -4, 3);
    scene.add(accentLight);

    // Master Group for workspace
    const workspaceGroup = new THREE.Group();
    scene.add(workspaceGroup);

    // --- 1. Stylized 3D Laptop ---
    const laptopGroup = new THREE.Group();

    // Laptop Base
    const baseGeo = new THREE.BoxGeometry(2.4, 0.12, 1.7);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xfffdf8,
      roughness: 0.3,
      metalness: 0.1,
    });
    const laptopBase = new THREE.Mesh(baseGeo, baseMat);
    laptopGroup.add(laptopBase);

    // Black edge outline for base
    const baseEdges = new THREE.EdgesGeometry(baseGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1a1a1a, linewidth: 2 });
    const baseOutline = new THREE.LineSegments(baseEdges, lineMat);
    laptopGroup.add(baseOutline);

    // Keyboard depression
    const kbGeo = new THREE.BoxGeometry(2.0, 0.04, 0.9);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0xffca29, roughness: 0.5 });
    const keyboard = new THREE.Mesh(kbGeo, kbMat);
    keyboard.position.set(0, 0.06, 0.2);
    laptopGroup.add(keyboard);

    // Trackpad
    const trackGeo = new THREE.BoxGeometry(0.7, 0.02, 0.45);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xe5d9bf });
    const trackpad = new THREE.Mesh(trackGeo, trackMat);
    trackpad.position.set(0, 0.065, -0.5);
    laptopGroup.add(trackpad);

    // Laptop Screen
    const screenHinge = new THREE.Group();
    screenHinge.position.set(0, 0.06, 0.82);

    const screenLidGeo = new THREE.BoxGeometry(2.4, 1.6, 0.08);
    const screenLid = new THREE.Mesh(screenLidGeo, baseMat);
    screenLid.position.set(0, 0.8, 0);
    screenHinge.add(screenLid);

    const screenOutline = new THREE.LineSegments(new THREE.EdgesGeometry(screenLidGeo), lineMat);
    screenOutline.position.set(0, 0.8, 0);
    screenHinge.add(screenOutline);

    // Glowing Screen Display (Blue / Code terminal window)
    const displayGeo = new THREE.PlaneGeometry(2.18, 1.38);
    const displayMat = new THREE.MeshBasicMaterial({ color: 0x1a2332 });
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(0, 0.8, -0.045);
    display.rotation.y = Math.PI; // Face towards user
    screenHinge.add(display);

    // Code lines on screen (yellow and coral horizontal bars)
    const codeColors = [0xffca29, 0x6da8dc, 0xe1413d, 0x2e9d6b, 0xfffdf8];
    for (let i = 0; i < 5; i++) {
      const codeLineGeo = new THREE.PlaneGeometry(0.6 + (i % 3) * 0.4, 0.07);
      const codeLineMat = new THREE.MeshBasicMaterial({ color: codeColors[i % codeColors.length] });
      const codeLine = new THREE.Mesh(codeLineGeo, codeLineMat);
      codeLine.position.set(-0.3 + (i % 2) * 0.1, 1.18 - i * 0.18, -0.048);
      codeLine.rotation.y = Math.PI;
      screenHinge.add(codeLine);
    }

    screenHinge.rotation.x = -Math.PI * 0.62; // Tilt open
    laptopGroup.add(screenHinge);

    laptopGroup.position.set(0, -0.2, 0);
    laptopGroup.rotation.y = -Math.PI * 0.15;
    laptopGroup.rotation.x = Math.PI * 0.06;
    workspaceGroup.add(laptopGroup);

    // --- 2. Floating Orbiting Elements (Git Nodes & Brackets) ---
    const orbiters: { mesh: THREE.Object3D; speed: number; radius: number; angle: number; yOffset: number }[] = [];

    // Yellow sphere node
    const sphereGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffca29, roughness: 0.2 });
    const yellowSphere = new THREE.Mesh(sphereGeo, yellowMat);
    yellowSphere.add(new THREE.LineSegments(new THREE.WireframeGeometry(sphereGeo), lineMat));
    workspaceGroup.add(yellowSphere);
    orbiters.push({ mesh: yellowSphere, speed: 0.8, radius: 1.9, angle: 0, yOffset: 0.4 });

    // Coral Red cube (Commit node)
    const cubeGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xe1413d, roughness: 0.2 });
    const redCube = new THREE.Mesh(cubeGeo, redMat);
    redCube.add(new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeo), lineMat));
    workspaceGroup.add(redCube);
    orbiters.push({ mesh: redCube, speed: -0.6, radius: 2.1, angle: Math.PI * 0.7, yOffset: -0.3 });

    // Soft Blue Octahedron (Gemini / AI symbol)
    const octaGeo = new THREE.OctahedronGeometry(0.32, 0);
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x6da8dc, roughness: 0.2 });
    const blueOcta = new THREE.Mesh(octaGeo, blueMat);
    blueOcta.add(new THREE.LineSegments(new THREE.EdgesGeometry(octaGeo), lineMat));
    workspaceGroup.add(blueOcta);
    orbiters.push({ mesh: blueOcta, speed: 0.7, radius: 2.2, angle: Math.PI * 1.4, yOffset: 0.8 });

    // Floating Cream Badge Token
    const cylGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 20);
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xfffdf8, roughness: 0.3 });
    const token = new THREE.Mesh(cylGeo, creamMat);
    token.add(new THREE.LineSegments(new THREE.EdgesGeometry(cylGeo), lineMat));
    workspaceGroup.add(token);
    orbiters.push({ mesh: token, speed: -0.9, radius: 1.7, angle: Math.PI * 0.3, yOffset: -0.8 });

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = currentMount.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 2;
      mouseY = y * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Smooth mouse follow
      targetRotationY = mouseX * 0.35;
      targetRotationX = mouseY * 0.25;
      workspaceGroup.rotation.y += (targetRotationY - workspaceGroup.rotation.y) * 0.05;
      workspaceGroup.rotation.x += (targetRotationX - workspaceGroup.rotation.x) * 0.05;

      // Gentle vertical floating motion
      workspaceGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

      // Orbit elements
      orbiters.forEach((item) => {
        item.angle += item.speed * 0.015;
        item.mesh.position.x = Math.cos(item.angle) * item.radius;
        item.mesh.position.z = Math.sin(item.angle) * item.radius;
        item.mesh.position.y = item.yOffset + Math.sin(elapsedTime * 2 + item.angle) * 0.12;
        item.mesh.rotation.x += 0.01;
        item.mesh.rotation.y += 0.015;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        if (currentMount && currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[380px] md:min-h-[440px] flex items-center justify-center relative cursor-grab active:cursor-grabbing"
    />
  );
}
