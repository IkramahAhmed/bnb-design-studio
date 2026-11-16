'use client';

import 'lenis/dist/lenis.css';
import Image from 'next/image';
import Lenis from 'lenis';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollMap } from '@/lib/scrollMap';
import { HouseScene } from '@/lib/three/HouseScene';
import { clamp } from '@/lib/three/math';
import { SceneDock } from './SceneDock';
import { SECTION_ORDER, SECTION_PATHS } from '@/content/site';
import { SceneHud, SceneRail } from './SceneRail';

const TURN_STEP = 0.7; // radians per press of the turn buttons

/**
 * The scroll-driven 3D background plus its controls. Loaded only in the browser (see
 * ExperienceLoader), so the page text is already readable before any of this downloads.
 */
export default function Experience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HouseScene | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const [active, setActive] = useState(0);
  const [night, setNight] = useState(false);
  const [ready, setReady] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nodes = SECTION_ORDER.map((section) => document.getElementById(section.id)).filter((el): el is HTMLElement => el !== null);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 800px)').matches || /Mobi|Android/i.test(navigator.userAgent);
    const map = new ScrollMap(nodes);
    const lenis = reduceMotion ? null : new Lenis({ autoRaf: true, anchors: true, lerp: 0.09, wheelMultiplier: 0.95 });
    lenisRef.current = lenis;

    let scene: HouseScene | null = null;
    try {
      scene = new HouseScene({
        canvas,
        isMobile,
        reduceMotion,
        getFraction: () => map.fraction(),
        onReady: () => setReady(true),
        onTheme: (dark) => {
          document.body.dataset.theme = dark ? 'dark' : 'light';
        },
        onDragChange: (dragging) => {
          document.body.classList.toggle('dragging', dragging);
          if (dragging) document.querySelector('[data-drag-hint]')?.classList.add('gone');
        },
      });
      scene.start();
      sceneRef.current = scene;
    } catch (error) {
      // No WebGL (old device, blocked GPU): the page still works, just without the 3D background.
      console.warn('3D scene unavailable', error);
    }

    const onScroll = () => {
      setActive(clamp(Math.round(map.fraction()), 0, Math.max(0, nodes.length - 1)));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? clamp(window.scrollY / max) : 0})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      scene?.dispose();
      sceneRef.current = null;
      lenis?.destroy();
      lenisRef.current = null;
      map.disconnect();
    };
  }, []);

  // Update URL to clean path as sections scroll by (no hash)
  useEffect(() => {
    const section = SECTION_ORDER[active];
    const path = SECTION_PATHS[section.id] ?? '/';
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.replaceState(null, '', path);
    }
  }, [active]);

  // After 3D scene is ready, scroll to section from stub page (stored in sessionStorage)
  useEffect(() => {
    if (!ready) return;
    const target = typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('scrollToSection')
      : null;
    if (target) {
      sessionStorage.removeItem('scrollToSection');
      const el = document.getElementById(target);
      if (el) {
        if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 0.1 });
        else el.scrollIntoView({ behavior: 'instant' });
      }
    }
  }, [ready]);

  const goTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toggleNight = useCallback(() => {
    const next = !night;
    sceneRef.current?.setNight(next);
    setNight(next);
  }, [night]);

  return (
    <>
      {!loaderGone && (
        <div
          className={ready ? 'site-loader out' : 'site-loader'}
          onAnimationEnd={() => { if (ready) setLoaderGone(true); }}
          aria-hidden="true"
        >
          <Image src="/logo.png" alt="BnB Design Studio" width={88} height={88} priority />
          <p className="loader-name">BnB Design Studio</p>
          <div className="loader-bar"><span /></div>
        </div>
      )}
      <canvas ref={canvasRef} className={ready ? 'stage ready' : 'stage'} aria-hidden="true" />
      <div className="progress" ref={progressRef} aria-hidden="true" />
      {ready && (
        <>
          <SceneDock
            night={night}
            onToggleNight={toggleNight}
            onTurn={(direction) => sceneRef.current?.turn(direction * TURN_STEP)}
            onReset={() => sceneRef.current?.resetTurn()}
          />
          <SceneRail sections={SECTION_ORDER} active={active} onSelect={goTo} />
          <SceneHud index={active} total={SECTION_ORDER.length} name={SECTION_ORDER[active].name} />
        </>
      )}
    </>
  );
}
