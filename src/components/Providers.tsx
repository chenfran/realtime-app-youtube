'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface ProvidersPage {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersPage) {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </>
  );
}
