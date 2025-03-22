import { View, StyleSheet } from 'react-native';
import { Button, Text as PaperText } from 'react-native-paper';
import { router } from 'expo-router';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <PaperText variant="headlineMedium" style={styles.title}>
        Masse Tracker
      </PaperText>
      
      <Button 
        mode="contained" 
        onPress={() => router.push('/(tabs)')}
        style={styles.button}
      >
        Registrer Forbruk
      </Button>
      
      <Button 
        mode="contained" 
        onPress={() => router.push('/(tabs)/(massetyper)')}
        style={styles.button}
      >
        Administrer Massetyper
      </Button>
      
      <Button 
        mode="contained" 
        onPress={() => router.push('/(tabs)/rapport')}
        style={styles.button}
      >
        Se Månedsrapport
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#0f172a',
  },
  button: {
    marginVertical: 8,
    backgroundColor: '#0891b2',
  },
});

export default HomeScreen;