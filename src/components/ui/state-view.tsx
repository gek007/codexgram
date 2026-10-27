import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '@/theme/theme-provider';
import { Button } from './button';
export function StateView({title,detail,loading=false,onRetry}:{title:string;detail?:string;loading?:boolean;onRetry?:()=>void}){const {colors}=useTheme();return <View style={{padding:28,gap:14,alignItems:'center'}}>{loading&&<ActivityIndicator color={colors.primary}/>}<Text style={{fontSize:20,fontWeight:'700',color:colors.text,textAlign:'center'}}>{title}</Text>{detail&&<Text style={{fontSize:15,lineHeight:22,color:colors.muted,textAlign:'center'}}>{detail}</Text>}{onRetry&&<Button label="Try again" onPress={onRetry}/>}</View>;}
