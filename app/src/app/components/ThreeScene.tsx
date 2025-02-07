"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LASLoader } from "@loaders.gl/las";
import { load } from "@loaders.gl/core";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
	  const controls = new OrbitControls(camera, renderer.domElement);
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);
      camera.position.set(0, 0, 200);
	  controls.update()

      const loadLas = async () => {
        const url = "/models/demo.laz";
        const lasData = await load(url, LASLoader, { las: { shape: "mesh" } });
		console.log(lasData);
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(lasData.attributes.POSITION.value);

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (let i = 0; i < positions.length; i += 3) {
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];

          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
        }

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const centerZ = (minZ + maxZ) / 2;

        for (let i = 0; i < positions.length; i += 3) {
          positions[i] -= centerX;
          positions[i + 1] -= centerY;
          positions[i + 2] -= centerZ;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
          color: 0x00ff00,
          size: 1,
          sizeAttenuation: false
        });

        const pointCloud = new THREE.Points(geometry, material);
        scene.add(pointCloud);

        function animate() {
          requestAnimationFrame(animate);
			controls.update();
          renderer.render(scene, camera);
        }
        animate();
      };

      loadLas();
    }
  }, []);

  return <div ref={containerRef} />;
};

export default ThreeScene;
