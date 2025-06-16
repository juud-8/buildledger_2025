import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import './index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
<QueryClientProvider client={queryClient}>
  <ToastProvider>
    <App />
  </ToastProvider>
</QueryClientProvider>

  </StrictMode>
);
