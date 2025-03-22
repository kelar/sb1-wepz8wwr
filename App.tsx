import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from './src/screens/HomeScreen';
import MasseTyperScreen from './src/screens/MasseTyperScreen';
import ProsjekterScreen from './src/screens/ProsjekterScreen';
import RegistrerForbrukScreen from './src/screens/RegistrerForbrukScreen';
import RapportScreen from './src/screens/RapportScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Hjem" 
            component={HomeScreen} 
            options={{ title: 'Masse Tracker' }}
          />
          <Stack.Screen 
            name="MasseTyper" 
            component={MasseTyperScreen} 
            options={{ title: 'Massetyper' }}
          />
          <Stack.Screen 
            name="Prosjekter" 
            component={ProsjekterScreen} 
            options={{ title: 'Prosjekter' }}
          />
          <Stack.Screen 
            name="RegistrerForbruk" 
            component={RegistrerForbrukScreen} 
            options={{ title: 'Registrer Forbruk' }}
          />
          <Stack.Screen 
            name="Rapport" 
            component={RapportScreen} 
            options={{ title: 'Månedsrapport' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}