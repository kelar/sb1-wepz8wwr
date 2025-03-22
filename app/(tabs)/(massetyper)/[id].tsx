import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button, Snackbar, Portal, Dialog, Surface, Text as PaperText } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { getMassetype, updateMassetype, deleteMassetype } from '@/src/lib/db';

export default function EditMassetypeScreen() {
  const { id } = useLocalSearchParams();
  const [navn, setNavn] = useState('');
  const [weightPerSkuff, setWeightPerSkuff] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadMassetype();
  }, [id]);

  const loadMassetype = async () => {
    try {
      setLoading(true);
      const massetype = await getMassetype(id as string);
      if (massetype) {
        setNavn(massetype.navn);
        setWeightPerSkuff(massetype.weight_per_skuff?.toString() || '');
      }
    } catch (err) {
      console.error('Error loading massetype:', err);
      setError('Kunne ikke laste massetype');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

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
      await updateMassetype(id as string, navn.trim(), weight);
      router.back();
    } catch (err) {
      console.error('Error updating massetype:', err);
      if (err.message === 'Duplicate name') {
        setError('En massetype med dette navnet finnes allerede');
      } else {
        setError('Kunne ikke oppdatere massetype');
      }
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteMassetype(id as string);
      router.back();
    } catch (err) {
      console.error('Error deleting massetype:', err);
      if (err.message === 'Cannot delete: Mass type is in use') {
        setError('Kan ikke slette: Massetypen er i bruk');
      } else {
        setError('Kunne ikke slette massetype');
      }
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <PaperText variant="headlineMedium" style={styles.title}>Rediger massetype</PaperText>
        <PaperText variant="bodyLarge" style={styles.subtitle}>Oppdater informasjon om massetypen</PaperText>
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
            Lagre endringer
          </Button>
        </View>

        <View style={styles.dangerZone}>
          <PaperText variant="titleMedium" style={styles.dangerTitle}>Faresone</PaperText>
          <PaperText variant="bodyMedium" style={styles.dangerText}>
            Sletting av en massetype kan ikke angres. Sørg for at du er sikker før du fortsetter.
          </PaperText>
          <Button 
            mode="contained"
            onPress={() => setShowDeleteDialog(true)}
            style={styles.deleteButton}
            contentStyle={styles.deleteButtonContent}
            labelStyle={styles.deleteButtonLabel}
            disabled={loading}
          >
            Slett massetype
          </Button>
        </View>
      </View>

      <Portal>
        <Dialog 
          visible={showDeleteDialog} 
          onDismiss={() => setShowDeleteDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>
            <PaperText variant="titleLarge" style={styles.dialogTitle}>
              Bekreft sletting
            </PaperText>
          </Dialog.Title>
          <Dialog.Content>
            <PaperText variant="bodyLarge" style={styles.dialogText}>
              Er du sikker på at du vil slette denne massetypen? Dette kan ikke angres.
            </PaperText>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button 
              onPress={() => setShowDeleteDialog(false)}
              mode="outlined"
              style={styles.dialogButton}
              textColor="#64748b"
            >
              Avbryt
            </Button>
            <Button 
              onPress={handleDelete} 
              mode="contained"
              style={[styles.dialogButton, styles.dialogDeleteButton]}
              loading={loading}
              disabled={loading}
            >
              Slett
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  dangerZone: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerTitle: {
    color: '#991b1b',
    marginBottom: 8,
  },
  dangerText: {
    color: '#7f1d1d',
    marginBottom: 16,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  deleteButtonContent: {
    height: 48,
  },
  deleteButtonLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
  },
  dialogTitle: {
    color: '#0f172a',
    marginBottom: 8,
  },
  dialogText: {
    color: '#334155',
    lineHeight: 24,
  },
  dialogActions: {
    marginTop: 8,
    gap: 8,
  },
  dialogButton: {
    minWidth: 100,
  },
  dialogDeleteButton: {
    backgroundColor: '#dc2626',
  },
  snackbar: {
    marginBottom: 20,
  },
});