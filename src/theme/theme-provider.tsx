import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

const light = { background:'#FAF9F6', surface:'#FFFFFF', text:'#242333', muted:'#6F6B80', border:'#E8E4F0', primary:'#6841D9', onPrimary:'#FFFFFF', secondary:'#EEE8FC', coral:'#FF7864', teal:'#167B70', danger:'#B32946' };
const dark = { background:'#171622', surface:'#242231', text:'#F9F7FF', muted:'#BCB7CF', border:'#3C374E', primary:'#B39AFF', onPrimary:'#20163A', secondary:'#3B2C57', coral:'#FF9A89', teal:'#7DDBCC', danger:'#FF9BAB' };
type Theme = { colors: typeof light; dark: boolean };
const Context = createContext<Theme>({colors:light,dark:false});
export function ThemeProvider({children}:{children:React.ReactNode}) { const isDark=useColorScheme()==='dark';return <Context.Provider value={{colors:isDark?dark:light,dark:isDark}}>{children}</Context.Provider>; }
export const useTheme = () => useContext(Context);
