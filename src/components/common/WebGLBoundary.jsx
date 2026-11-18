import { Component, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import { useWebGL } from '../../hooks/useWebGL';
/** Catches runtime WebGL / Three errors and shows the fallback instead of crashing the page. */
class Boundary extends Component {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(err) {
        console.warn('3D scene disabled:', err);
    }
    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}
/** Canvas wrapper: WebGL detection + error boundary + Suspense + reduced-motion aware frameloop. */
export default function SafeCanvas({ children, fallback, label, ...rest }) {
    const ok = useWebGL();
    const reduce = useReducedMotion();
    if (!ok)
        return <>{fallback}</>;
    return (<Boundary fallback={fallback}>
      <div role="img" aria-label={label} className="h-full w-full">
        <Canvas dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }} frameloop={reduce ? 'demand' : 'always'} {...rest}>
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      </div>
    </Boundary>);
}
