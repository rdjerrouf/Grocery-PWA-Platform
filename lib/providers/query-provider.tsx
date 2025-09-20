'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache time: 30 minutes
            gcTime: 30 * 60 * 1000,
            // Retry failed requests 1 time
            retry: 1,
            // Refetch on window focus in production only
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Don't refetch on reconnect to save bandwidth
            refetchOnReconnect: false,
            // Enable network mode to handle offline scenarios
            networkMode: 'offlineFirst',
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
            // Network mode for mutations
            networkMode: 'online',
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}