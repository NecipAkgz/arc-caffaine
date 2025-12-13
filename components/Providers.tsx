'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient();

/**
 * Providers Component
 *
 * Wraps the application with necessary providers for Web3 functionality.
 * Uses dynamic import to avoid SSR issues with WalletConnect (requires indexedDB).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<any>(null);

  React.useEffect(() => {
    // Load config only on client side to avoid indexedDB SSR errors
    import('@/lib/config').then((mod) => {
      setConfig(mod.config);
    });
  }, []);

  // Show nothing until config is loaded (prevents hydration mismatch)
  if (!config) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#f59e0b',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
