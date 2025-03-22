/**
 * Tab Navigation Layout
 * 
 * This file configures the bottom tab navigation of the application.
 * It uses Expo Router's built-in tab navigation system.
 */
import { Tabs } from 'expo-router';
import { ListTodo, Package, Building2, FileBarChart, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Configure tab bar appearance
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e5e5',
        },
        // Configure tab colors
        tabBarActiveTintColor: '#0891b2',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerShadowVisible: false,
      }}
    >
      {/* Registrer Forbruk Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Registrer Forbruk',
          headerTitle: 'Registrer Forbruk',
          tabBarIcon: ({ color, size }) => <ListTodo size={size} color={color} />,
        }}
      />

      {/* Massetyper Tab */}
      <Tabs.Screen
        name="(massetyper)"
        options={{
          title: 'Massetyper',
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />

      {/* Prosjekter Tab */}
      <Tabs.Screen
        name="(prosjekter)"
        options={{
          title: 'Prosjekter',
          tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />,
        }}
      />

      {/* Rapport Tab */}
      <Tabs.Screen
        name="rapport"
        options={{
          title: 'Rapport',
          headerTitle: 'Månedsrapport',
          tabBarIcon: ({ color, size }) => <FileBarChart size={size} color={color} />,
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Innstillinger',
          headerTitle: 'Innstillinger',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}