import { useMemo } from 'react';

export function useWebGL(): boolean {
  return useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
    } catch {
      return false;
    }
  }, []);
}
