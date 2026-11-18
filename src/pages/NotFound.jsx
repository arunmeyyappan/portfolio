import MagneticButton from '../components/common/MagneticButton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
export default function NotFound() {
    useDocumentTitle('Page not found');
    return (<section className="container-x grid min-h-[80vh] place-items-center text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">This page <span className="gradient-text">doesn&apos;t exist.</span></h1>
        <div className="mt-10"><MagneticButton to="/">Back home</MagneticButton></div>
      </div>
    </section>);
}
