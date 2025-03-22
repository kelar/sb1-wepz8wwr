import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { TextInput, Button, Snackbar, IconButton, Text as PaperText, Surface } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { getMassetyper, getProsjekter, addForbruk, subscribeToDataChanges } from '../../src/lib/db';
import { Plus, Minus } from 'lucide-react-native';

export default function RegisterScreen() {
  const [massetyper, setMassetyper] = useState([]);
  const [prosjekter, setProsjekter] = useState([]);
  const [antallSkuffer, setAntallSkuffer] = useState('');
  const [selectedMassetype, setSelectedMassetype] = useState(null);
  const [selectedProsjekt, setSelectedProsjekt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    loadData();

    // Subscribe to data changes
    const unsubscribe = subscribeToDataChanges(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [massetyperData, prosjekterData] = await Promise.all([
        getMassetyper(),
        getProsjekter()
      ]);
      setMassetyper(massetyperData);
      setProsjekter(prosjekterData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Kunne ikke laste nødvendig data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrer = async () => {
    // Reset any previous error
    setError(null);

    if (!selectedMassetype || !selectedProsjekt) {
      setSnackbarMessage('Vennligst velg massetype og prosjekt');
      setSnackbarVisible(true);
      return;
    }

    const antall = parseInt(antallSkuffer, 10);
    if (!antall || antall <= 0) {
      setSnackbarMessage('Antall skuffer må være større enn null');
      setSnackbarVisible(true);
      return;
    }

    try {
      await addForbruk(
        selectedMassetype,
        selectedProsjekt,
        antall
      );
      setAntallSkuffer('');
      setSelectedMassetype(null);
      setSelectedProsjekt(null);
      setSnackbarMessage('Forbruk registrert');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Error registering forbruk:', err);
      setSnackbarMessage('Kunne ikke registrere forbruk');
      setSnackbarVisible(true);
    }
  };

  const handleIncrement = () => {
    const currentValue = parseInt(antallSkuffer, 10) || 0;
    setAntallSkuffer((currentValue + 1).toString());
  };

  const handleDecrement = () => {
    const currentValue = parseInt(antallSkuffer, 10) || 0;
    if (currentValue > 1) { // Changed from 0 to 1 to prevent setting to 0
      setAntallSkuffer((currentValue - 1).toString());
    }
  };

  const handleAntallChange = (value: string) => {
    // Only allow positive numbers
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      if (!value || numValue > 0) {
        setAntallSkuffer(value);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0891b2" />
        <PaperText style={styles.loadingText}>Laster...</PaperText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <PaperText variant="titleMedium" style={styles.label}>Velg Massetype</PaperText>
          <View style={styles.massetypeGrid}>
            {massetyper.map((type) => (
              <Button
                key={type.id}
                mode={selectedMassetype === type.id ? 'contained' : 'outlined'}
                onPress={() => setSelectedMassetype(type.id)}
                style={styles.massetypeButton}
                labelStyle={[
                  styles.buttonLabel,
                  selectedMassetype === type.id && styles.selectedButtonLabel
                ]}
                buttonColor={selectedMassetype === type.id ? '#0891b2' : undefined}
                textColor={selectedMassetype === type.id ? '#ffffff' : '#0f172a'}
              >
                {type.navn}
              </Button>
            ))}
          </View>

          <PaperText variant="titleMedium" style={[styles.label, styles.mt20]}>Velg Prosjekt</PaperText>
          <View style={styles.projectList}>
            {prosjekter.map((project) => (
              <Button
                key={project.id}
                mode={selectedProsjekt === project.id ? 'contained' : 'outlined'}
                onPress={() => setSelectedProsjekt(project.id)}
                style={styles.projectButton}
                labelStyle={[
                  styles.buttonLabel,
                  selectedProsjekt === project.id && styles.selectedButtonLabel
                ]}
                buttonColor={selectedProsjekt === project.id ? '#0891b2' : undefined}
                textColor={selectedProsjekt === project.id ? '#ffffff' : '#0f172a'}
              >
                {project.navn}
              </Button>
            ))}
          </View>

          <PaperText variant="titleMedium" style={[styles.label, styles.mt20]}>Antall Skuffer</PaperText>
          <View style={styles.counterContainer}>
            <IconButton
              icon={() => <Minus size={20} color="#64748b" />}
              mode="outlined"
              onPress={handleDecrement}
              style={styles.counterButton}
              disabled={!antallSkuffer || parseInt(antallSkuffer, 10) <= 1}
            />
            <TextInput
              mode="outlined"
              value={antallSkuffer}
              onChangeText={handleAntallChange}
              keyboardType="numeric"
              style={styles.counterInput}
              placeholder="0"
              outlineColor="#94a3b8"
              activeOutlineColor="#0891b2"
              textColor="#0f172a"
            />
            <IconButton
              icon={() => <Plus size={20} color="#0891b2" />}
              mode="outlined"
              onPress={handleIncrement}
              style={styles.counterButton}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleRegistrer}
            style={styles.submitButton}
            labelStyle={styles.submitButtonLabel}
            buttonColor="#0891b2"
          >
            Registrer Forbruk
          </Button>
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    color: '#0f172a',
    marginBottom: 12,
  },
  massetypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  massetypeButton: {
    flex: 1,
    minWidth: '48%',
    marginBottom: 8,
    borderColor: '#94a3b8',
  },
  projectList: {
    gap: 8,
  },
  projectButton: {
    marginBottom: 4,
    borderColor: '#94a3b8',
  },
  buttonLabel: {
    fontSize: 14,
    padding: 4,
    color: '#0f172a',
  },
  selectedButtonLabel: {
    color: '#ffffff',
    fontWeight: '500',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  counterButton: {
    margin: 0,
    borderColor: '#94a3b8',
  },
  counterInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  mt20: {
    marginTop: 20,
  },
  snackbar: {
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#334155',
  },
});