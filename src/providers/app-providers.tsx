import React from 'react';
import { ThemeProvider } from '@/theme/theme-provider';
export function AppProviders({children}:{children:React.ReactNode}){return <ThemeProvider>{children}</ThemeProvider>;}
