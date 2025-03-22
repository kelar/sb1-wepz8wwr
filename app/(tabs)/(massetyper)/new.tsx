import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Snackbar, Surface, Text as PaperText } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { addMassetype } from '@/src/lib/db';

export default function NewMassetypeScreen() {
  const [navn, setNavn] = useState('');
  const [weightPerSkuff, setWeightPerSkuff] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleSubmit = async () => {
    if (!navn.trim()) {
      setError('Navn må fylles ut');
      setSnackbarVisible(true);
      return;
    }

    const weight = weightPerSkuff ? parseFloat(weightPerSkuff) : null;
    if (weightPerSkuff && (isNaN(weight) || weight <= 0)) {
      setError('Vekt må være et positivt tall');
      setSnackbarVisible(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addMassetype(navn.trim(), weight);
      router.back();
    } catch (err) {
      console.error('Error adding massetype:', err);
      if (err.message === 'Duplicate name') {
        setError('En massetype med dette navnet finnes allerede');
      } else {
        setError('Kunne ikke legge til massetype');
      }
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <PaperText variant="headlineMedium" style={styles.title}>Ny massetype</PaperText>
        <PaperText variant="bodyLarge" style={styles.subtitle}>Legg til en ny type masse</PaperText>
      </Surface>

      <View style={styles.form}>
        <TextInput
          label="Navn på massetype"
          value={navn}
          onChangeText={setNavn}
          style={styles.input}
          mode="outlined"
          autoFocus
          disabled={loading}
          outlineColor="#94a3b8"
          activeOutlineColor="#0891b2"
          textColor="#0f172a"
          theme={{
            colors: {
              onSurfaceVariant: '#64748b',
            },
          }}
        />

        <TextInput
          label="Vekt per skuff (kg)"
          value={weightPerSkuff}
          onChangeText={setWeightPerSkuff}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          disabled={loading}
          placeholder="F.eks. 1000"
          outlineColor="#94a3b8"
          activeOutlineColor="#0891b2"
          textColor="#0f172a"
          theme={{
            colors: {
              onSurfaceVariant: '#64748b',
            },
          }}
        />

        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            onPress={() => router.back()}
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
            textColor="#64748b"
          >
            Avbryt
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSubmit}
            style={[styles.button, styles.submitButton]}
            loading={loading}
            disabled={loading}
          >
            Lagre
          </Button>
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
  },
  title: {
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
  },
  form: {
    padding: 16,
    gap: 16,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    minWidth: 120,
  },
  cancelButton: {
    borderColor: '#94a3b8',
  },
  submitButton: {
    backgroundColor: '#0891b2',
  },
  snackbar: {
    marginBottom: 20,
  },
});