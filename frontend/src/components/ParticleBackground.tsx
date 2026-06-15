"use client";

import React from 'react';
import Particles, { ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';
import { useTheme } from '@/contexts/ThemeContext';

export default function ParticleBackground() {
  const { theme } = useTheme();

  const initParticles = async (engine: Engine) => {
    await loadSlim(engine);
  };

  const getParticleColor = () => {
    return theme === 'dark' ? '#1c9cf0' : '#1e9df1';
  };

  return (
    <ParticlesProvider init={initParticles}>
      <Particles
        id="tsparticles"
        options={{
          fullScreen: { enable: true, zIndex: -1 },
          background: {
            color: { value: "transparent" },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: { enable: true },
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: getParticleColor(),
            },
            links: {
              color: getParticleColor(),
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
              },
              value: 40,
            },
            opacity: {
              value: 0.3,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
      />
    </ParticlesProvider>
  );
}
