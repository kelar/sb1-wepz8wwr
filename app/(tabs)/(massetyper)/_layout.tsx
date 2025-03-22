import { Stack } from 'expo-router';

export default function MassetyperLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{ 
          title: 'Massetyper'
        }}
      />
      <Stack.Screen 
        name="new"
        options={{ 
          title: 'Ny Massetype',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="[id]"
        options={{ 
          title: 'Rediger Massetype',
          presentation: 'modal'
        }}
      />
    </Stack>
  );
}