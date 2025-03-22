import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Card, Snackbar, Text as PaperText } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { getMassetyper, subscribeToDataChanges } from '@/src/lib/db';
import { router } from 'expo-router';

export default function MassetyperScreen() {
  const [massetyper, setMassetyper] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    fetchMassetyper();

    // Subscribe to data changes
    const unsubscribe = subscribeToDataChanges(() => {
      fetchMassetyper();
    });

    return () => unsubscribe();
  }, []);

  const fetchMassetyper = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMassetyper();
      setMassetyper(data);
    } catch (err) {
      console.error('Error fetching massetyper:', err);
      setError('Kunne ikke hente massetyper');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    router.push('/(tabs)/(massetyper)/new');
  };

  const handleEdit = (id) => {
    router.push({
      pathname: '/(tabs)/(massetyper)/[id]',
      params: { id }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0891b2" />
        <PaperText style={styles.loadingText}>Laster massetyper...</PaperText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {massetyper.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <PaperText style={styles.emptyText}>Ingen massetyper er lagt til ennå</PaperText>
              <Button 
                mode="contained" 
                onPress={handleAddNew}
                style={styles.addFirstButton}
              >
                Legg til din første massetype
              </Button>
            </Card.Content>
          </Card>
        ) : (
          massetyper.map((type) => (
            <Card key={type.id} style={styles.card} onPress={() => handleEdit(type.id)}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <PaperText variant="titleMedium" style={styles.cardTitle}>{type.navn}</PaperText>
                  {type.weight_per_skuff && (
                    <PaperText variant="bodyMedium" style={styles.weightText}>
                      {type.weight_per_skuff.toLocaleString('no-NO')} kg/skuff
                    </PaperText>
                  )}
                </View>
                <PaperText variant="bodySmall" style={styles.cardDescription}>
                  Registrert: {new Date(type.created_at).toLocaleDateString('no-NO')}
                </PaperText>
              </Card.Content>
            </Card>
          ))
        )}

        {massetyper.length > 0 && (
          <Button 
            mode="contained" 
            onPress={handleAddNew}
            style={styles.addButton}
            icon={() => <Plus size={20} color="#fff" />}
          >
            Legg til ny
          </Button>
        )}
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {error || 'Det oppstod en feil ved lasting av massetyper'}
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
    paddingTop: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    color: '#1f2937',
  },
  weightText: {
    color: '#0891b2',
  },
  cardDescription: {
    color: '#64748b',
  },
  snackbar: {
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    marginTop: 20,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: '#0891b2',
  },
  addButton: {
    marginTop: 8,
    backgroundColor: '#0891b2',
  },
});