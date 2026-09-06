// src/components/Providers.tsx
'use client';

import React from 'react';
import { Provider } from 'jotai';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      {children}
    </Provider>
  );
}