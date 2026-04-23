import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import React from 'react';
import './assets/styles/index.css'
import App from './App.tsx'

// 캐시 저장소
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    
    // React.StrictMode 검사용
    <React.StrictMode>

        {/*  queryClient 다 사용할 수 있께 감싸줌  */}
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
  )
