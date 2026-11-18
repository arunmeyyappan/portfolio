import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ContentProvider } from './context/ContentContext';
import './styles/index.css';
createRoot(document.getElementById('root')).render(<StrictMode>
    <ErrorBoundary>
      <ContentProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ContentProvider>
    </ErrorBoundary>
  </StrictMode>);
