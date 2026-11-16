import '@fontsource-variable/nunito';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';
import { ConfirmProvider } from './confirm.jsx';
import './styles/theme.css';
import './styles/layout.css';
import './styles/pages.css';
import { ToastProvider } from './toast.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </HashRouter>
  </StrictMode>,
);
