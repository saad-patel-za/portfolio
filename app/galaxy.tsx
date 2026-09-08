'use client';

import { useEffect, useRef } from 'react';

/** A single GPU particle draw call for the spiral, plus a distant star field. */
export default function Galaxy({ enabled }: { enabled: boolean }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let cancelled = false;
    let dispose = () => {};

    import('three').then(THREE => {
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
      } catch { return; }

      const compact = window.matchMedia('(max-width: 700px)').matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1 : 1.5));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(48, 1, .1, 100);
      camera.position.set(0, 0, 12);
      const count = compact ? 3500 : 8000;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const phases = new Float32Array(count);
      const inside = new THREE.Color('#d3ff8e');
      const middle = new THREE.Color('#56bbb1');
      const outside = new THREE.Color('#8175da');
      // A seeded distribution remains stable when the user toggles motion.
      let seed = 91;
      const random = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
      for (let i = 0; i < count; i++) {
        const radius = Math.pow(random(), .72) * 6;
        const angle = (i % 4) / 4 * Math.PI * 2 + radius * 1.12;
        const scatter = (random() - .5) * Math.pow(radius / 6, .6) * 1.5;
        positions[i * 3] = Math.cos(angle + scatter) * radius;
        positions[i * 3 + 1] = (random() - .5) * (.16 + radius * .12);
        positions[i * 3 + 2] = Math.sin(angle + scatter) * radius;
        const color = radius < 2 ? inside.clone().lerp(middle, radius / 2) : middle.clone().lerp(outside, (radius - 2) / 4);
        color.toArray(colors, i * 3);
        sizes[i] = .45 + Math.pow(random(), 4) * 2.3;
        phases[i] = random() * Math.PI * 2;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
      const material = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
        vertexShader: `
          attribute vec3 color;
          attribute float aSize;
          attribute float aPhase;
          uniform float uTime;
          uniform float uPixelRatio;
          varying vec3 vColor;
          varying float vGlow;
          void main() {
            vColor = color;
            vGlow = .65 + .35 * sin(uTime * .7 + aPhase);
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * viewPosition;
            gl_PointSize = clamp(aSize * uPixelRatio * 25.0 / max(1.0, -viewPosition.z), 1.0, 12.0);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vGlow;
          void main() {
            float distanceToCenter = length(gl_PointCoord - .5);
            float glow = pow(max(0.0, 1.0 - distanceToCenter * 2.0), 2.5);
            gl_FragColor = vec4(vColor, glow * vGlow * .85);
          }
        `,
      });
      const galaxy = new THREE.Points(geometry, material);
      galaxy.rotation.set(.9, 0, -.35);
      galaxy.position.set(3, .6, -1);
      scene.add(galaxy);

      const starGeometry = new THREE.BufferGeometry();
      const stars = new Float32Array((compact ? 300 : 800) * 3);
      for (let i = 0; i < stars.length; i += 3) {
        stars[i] = (random() - .5) * 32;
        stars[i + 1] = (random() - .5) * 24;
        stars[i + 2] = -3 - random() * 15;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3));
      const starMaterial = new THREE.PointsMaterial({ color: '#b7d7d2', size: .024, transparent: true, opacity: .55, depthWrite: false });
      const field = new THREE.Points(starGeometry, starMaterial);
      scene.add(field);

      let frame = 0;
      let elapsed = 0;
      let last = 0;
      let pointerX = 0;
      let pointerY = 0;
      let scroll = 0;
      let progress = 0;
      const draw = () => renderer.render(scene, camera);
      const resize = () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        draw();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      resize();
      const onPointer = (event: PointerEvent) => {
        pointerX = event.clientX / window.innerWidth - .5;
        pointerY = event.clientY / window.innerHeight - .5;
      };
      const onScroll = () => { scroll = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
      const tick = (now: number) => {
        frame = 0;
        if (cancelled || document.hidden || !enabled) return;
        // Cap to 30 fps, and exclude hidden-tab time from the animation clock.
        if (now - last >= 32) {
          elapsed += Math.min((now - last) / 1000, .05);
          last = now;
          progress += (scroll - progress) * .04;
          material.uniforms.uTime.value = elapsed;
          galaxy.rotation.y = elapsed * .035 + progress * .8;
          galaxy.rotation.z = -.35 + progress * .4;
          galaxy.position.y = .6 + progress * 2;
          field.rotation.z = elapsed * -.008;
          camera.position.x += (pointerX * .65 - camera.position.x) * .04;
          camera.position.y += (-pointerY * .4 - camera.position.y) * .04;
          camera.position.z = 12 - progress * 1.7;
          draw();
        }
        frame = requestAnimationFrame(tick);
      };
      const onVisibility = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        if (!document.hidden && enabled) { last = performance.now(); frame = requestAnimationFrame(tick); }
      };
      if (enabled) {
        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('visibilitychange', onVisibility);
        onScroll();
        frame = requestAnimationFrame(tick);
      }
      const contextLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); container.classList.remove('galaxy-ready'); };
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      container.classList.add('galaxy-ready');
      dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('scroll', onScroll);
        document.removeEventListener('visibilitychange', onVisibility);
        renderer.domElement.removeEventListener('webglcontextlost', contextLost);
        geometry.dispose(); material.dispose(); starGeometry.dispose(); starMaterial.dispose();
        renderer.dispose(); renderer.domElement.remove(); container.classList.remove('galaxy-ready');
      };
    }).catch(() => {});

    return () => { cancelled = true; dispose(); };
  }, [enabled]);

  return <div className="galaxy-background" ref={host} aria-hidden="true" />;
}
