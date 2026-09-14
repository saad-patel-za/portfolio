'use client';
import { useEffect, useRef } from 'react';

export default function Sculpt({enabled}:{enabled:boolean}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const container=host.current;
    let disposed=false;
    let release=()=>{};
    Promise.all([import('three'),import('three/examples/jsm/environments/RoomEnvironment.js')]).then(([THREE,{RoomEnvironment}])=>{
      if(disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, powerPreference:'low-power'}); } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
      renderer.setClearColor(0x10110f,0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.15;
      container.appendChild(renderer.domElement);
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(35,1,.1,100);
      camera.position.z=8.4;
      const pmrem=new THREE.PMREMGenerator(renderer);
      const room=new RoomEnvironment();
      const environment=pmrem.fromScene(room,.04);
      scene.environment=environment.texture;
      room.dispose();
      const geometry=new THREE.TorusKnotGeometry(1.32,.42,220,36,2,3);
      const material=new THREE.MeshPhysicalMaterial({color:0xbddd66,metalness:.94,roughness:.23,clearcoat:1,clearcoatRoughness:.14});
      const mesh=new THREE.Mesh(geometry,material);
      mesh.rotation.set(.4,.2,-.45);
      const group=new THREE.Group();group.add(mesh);scene.add(group);
      const wireGeometry=new THREE.IcosahedronGeometry(2.2,1);
      const edges=new THREE.EdgesGeometry(wireGeometry);
      const wireMaterial=new THREE.LineBasicMaterial({color:0x6b7750,transparent:true,opacity:.17});
      const wire=new THREE.LineSegments(edges,wireMaterial);
      scene.add(wire);
      const key=new THREE.DirectionalLight(0xe9ffd0,4);key.position.set(3,4,3);scene.add(key);
      const fill=new THREE.PointLight(0xd3ff5f,40);fill.position.set(-3,-2,3);scene.add(fill);
      const resize=()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
      resize();const observer=new ResizeObserver(resize);observer.observe(container);
      let targetX=0,targetY=0,visible=true,frame=0;
      const pointer=(e:PointerEvent)=>{const bounds=container.getBoundingClientRect();targetX=(e.clientX-bounds.left)/bounds.width-.5;targetY=(e.clientY-bounds.top)/bounds.height-.5;};
      const leave=()=>{targetX=0;targetY=0;};
      container.addEventListener('pointermove',pointer);container.addEventListener('pointerleave',leave);
      const started=performance.now();
      const render=(now:number)=>{
        if(disposed)return;
        if(visible&&!document.hidden){
          const t=(now-started)*.001;
          if(enabled){mesh.rotation.y=t*.13+.2;mesh.rotation.z=Math.sin(t*.22)*.12-.45;mesh.position.y=Math.sin(t*.65)*.08;wire.rotation.y=-t*.045;group.rotation.y+=(targetX*.55-group.rotation.y)*.04;group.rotation.x+=(targetY*.35-group.rotation.x)*.04;}
          renderer.render(scene,camera);
        }
        if(enabled)frame=requestAnimationFrame(render);
      };
      const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});intersection.observe(container);
      render(performance.now());
      container.classList.add('webgl-ready');
      release=()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();container.removeEventListener('pointermove',pointer);container.removeEventListener('pointerleave',leave);geometry.dispose();material.dispose();wireGeometry.dispose();edges.dispose();wireMaterial.dispose();environment.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();container.classList.remove('webgl-ready');};
    }).catch(()=>{});
    return ()=>{disposed=true;release();};
  },[enabled]);
  return <div className="sculpt" ref={host} aria-hidden="true"><div className="sculpt-fallback"><span>✳</span></div></div>;
}
