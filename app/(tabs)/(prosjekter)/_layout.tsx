import { Stack } from 'expo-router';

export default function ProsjekterLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{ 
          title: 'Prosjekter'
        }}
      />
      <Stack.Screen 
        name="new"
        options={{ 
          title: 'Nytt Prosjekt',
          presentation: 'modal'
        }}
      />
      <Stack.Screen 
        name="[id]"
        options={{ 
          title: 'Rediger Prosjekt',
          presentation: 'modal'
        }}
      />
    </Stack>
  );
}