import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
export function Button({label,onPress,disabled=false,loading=false,secondary=false}:{label:string;onPress:()=>void;disabled?:boolean;loading?:boolean;secondary?:boolean}) {
 const {colors}=useTheme();const blocked=disabled||loading;
 return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled:blocked,busy:loading}} disabled={blocked} onPress={onPress} style={({pressed})=>({minHeight:50,borderRadius:16,paddingHorizontal:20,paddingVertical:14,backgroundColor:secondary?colors.secondary:colors.primary,opacity:blocked?.55:pressed?.8:1,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:8})}>{loading&&<ActivityIndicator color={secondary?colors.primary:colors.onPrimary}/>}<Text style={{fontSize:16,fontWeight:'700',color:secondary?colors.text:colors.onPrimary}}>{label}</Text></Pressable>;
}
