import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const PhotorealEarth: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;

    // 1. WebGL Renderer matching Terra exactly
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 200);
    camera.position.set(0, 0, 3.7);

    // Sun direction vector
    const sunDirection = new THREE.Vector3(0.75, 0.2, 1).normalize();

    // 3. Globe Master Group with Earth's 23.5-degree axial tilt
    const globeGroup = new THREE.Group();
    globeGroup.rotation.z = (23.5 * Math.PI) / 180;
    globeGroup.rotation.y = 2.2;
    scene.add(globeGroup);

    // Responsive Positioning: on wide screens, place Earth on the right
    const updatePosition = () => {
      if (width / height < 1) {
        globeGroup.position.set(0, -0.2, 0);
      } else {
        globeGroup.position.set(0.95, -0.3, 0);
      }
    };
    updatePosition();

    // 4. Texture Loading
    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (path: string, isSRGB = false) => {
      const tex = textureLoader.load(path);
      if (isSRGB) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    };

    const dayTexture = loadTexture('/textures/earth-day.jpg', true);
    const nightTexture = loadTexture('/textures/earth-night.png', true);
    const specularTexture = loadTexture('/textures/earth-specular.jpg');

    // 5. Earth Sphere Mesh & Terra's exact Day/Night/Specular Shader
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const earthMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * modelPosition;
          vUv = uv;
          vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
          vPosition = modelPosition.xyz;
        }
      `,
      fragmentShader: `
        uniform sampler2D uDay;
        uniform sampler2D uNight;
        uniform sampler2D uSpecular;
        uniform vec3 uSunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDirection = normalize(vPosition - cameraPosition);
          vec3 color = vec3(0.0);

          float sunOrientation = dot(uSunDirection, normal);

          // Day / night blend
          float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
          vec3 dayColor = texture2D(uDay, vUv).rgb;
          dayColor = pow(dayColor, vec3(0.85)) * 1.25; // lift + saturate the day side
          vec3 nightColor = texture2D(uNight, vUv).rgb * 1.4;
          color = mix(nightColor, dayColor, dayMix);

          // Subtle white specular sun-glint on oceans
          float specularStrength = texture2D(uSpecular, vUv).r;
          vec3 reflection = reflect(-uSunDirection, normal);
          float specular = pow(max(0.0, dot(reflection, -viewDirection)), 30.0);
          color += specular * specularStrength * dayMix * 0.5;

          gl_FragColor = vec4(color, 1.0);
          #include <colorspace_fragment>
        }
      `,
      uniforms: {
        uDay: { value: dayTexture },
        uNight: { value: nightTexture },
        uSpecular: { value: specularTexture },
        uSunDirection: { value: sunDirection }
      }
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // 6. Deep Space 1400 Stars Field
    const starPositions = new Float32Array(4200);
    const starSizes = new Float32Array(1400);
    for (let e = 0; e < 1400; e++) {
      const r = 40 + 40 * Math.random();
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[3 * e] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[3 * e + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[3 * e + 2] = r * Math.cos(phi);
      starSizes[e] = 0.18 * Math.random() + 0.04;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.13,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const starfield = new THREE.Points(starGeometry, starMaterial);
    scene.add(starfield);

    // 7. Interactive Drag to Rotate with Inertia
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let dragVelocityX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      dragVelocityX = deltaX * 0.003;
      globeGroup.rotation.y += dragVelocityX;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      updatePosition();
    });
    resizeObserver.observe(container);

    // 9. Animation Loop with Clock
    let running = true;
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      if (!prefersReducedMotion) {
        if (!isDragging) {
          dragVelocityX *= 0.95;
          globeGroup.rotation.y += ((2 * Math.PI) / 80) * delta + dragVelocityX;
          starfield.rotation.y += 0.004 * delta;
        }
      }
      renderer.render(scene, camera);
      if (running) animId = requestAnimationFrame(animate);
    };

    animate();

    const timer = window.setTimeout(() => setLoaded(true), 120);

    return () => {
      window.clearTimeout(timer);
      running = false;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      earthGeometry.dispose();
      starGeometry.dispose();
      dayTexture.dispose();
      nightTexture.dispose();
      specularTexture.dispose();
      earthMaterial.dispose();
      starMaterial.dispose();
      renderer.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full transition-opacity duration-[1600ms] ease-out pointer-events-auto cursor-grab active:cursor-grabbing"
      style={{ opacity: loaded ? 1 : 0 }}
    />
  );
};
