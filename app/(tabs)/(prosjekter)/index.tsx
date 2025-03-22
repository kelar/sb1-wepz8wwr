import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Card, Snackbar, Text as PaperText } from 'react-native-paper';
import { Plus, Building2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { getProsjekter, subscribeToDataChanges } from '@/src/lib/db';
import { router } from 'expo-router';

export default function ProsjekterScreen() {
  const [prosjekter, setProsjekter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    fetchProsjekter();

    // Subscribe to data changes
    const unsubscribe = subscribeToDataChanges(() => {
      fetchProsjekter();
    });

    return () => unsubscribe();
  }, []);

  const fetchProsjekter = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProsjekter();
      setProsjekter(data);
    } catch (err) {
      console.error('Error fetching prosjekter:', err);
      setError('Kunne ikke hente prosjekter');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    router.push('/(tabs)/(prosjekter)/new');
  };

  const handleEdit = (id) => {
    router.push({
      pathname: '/(tabs)/(prosjekter)/[id]',
      params: { id }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0891b2" />
        <PaperText style={styles.loadingText}>Laster prosjekter...</PaperText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {prosjekter.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Building2 size={48} color="#64748b" style={styles.emptyIcon} />
              <PaperText variant="titleMedium" style={styles.emptyTitle}>
                Ingen prosjekter ennå
              </PaperText>
              <PaperText style={styles.emptyText}>
                Start med å legge til ditt første prosjekt for å begynne registrering av masseforbruk.
              </PaperText>
              <Button 
                mode="contained" 
                onPress={handleAddNew}
                style={styles.addFirstButton}
                contentStyle={styles.addFirstButtonContent}
              >
                Opprett første prosjekt
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            <View style={styles.header}>
              <PaperText variant="titleLarge" style={styles.title}>
                Dine Prosjekter
              </PaperText>
              <PaperText variant="bodyMedium" style={styles.subtitle}>
                Administrer og hold oversikt over prosjektene dine
              </PaperText>
            </View>

            <View style={styles.grid}>
              {prosjekter.map((prosjekt) => (
                <Card 
                  key={prosjekt.id} 
                  style={styles.card} 
                  onPress={() => handleEdit(prosjekt.id)}
                >
                  <Card.Content style={styles.cardContent}>
                    <Building2 size={24} color="#0891b2" style={styles.cardIcon} />
                    <PaperText variant="titleMedium" style={styles.cardTitle}>
                      {prosjekt.navn}
                    </PaperText>
                    <PaperText variant="bodySmall" style={styles.cardDate}>
                      Opprettet {new Date(prosjekt.created_at).toLocaleDateString('no-NO')}
                    </PaperText>
                  </Card.Content>
                </Card>
              ))}
            </View>

            <Button 
              mode="contained" 
              onPress={handleAddNew}
              style={styles.addButton}
              icon={() => <Plus size={20} color="#fff" />}
            >
              Legg til nytt prosjekt
            </Button>
          </>
        )}
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {error || 'Det oppstod en feil ved lasting av prosjekter'}
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
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    color: '#64748b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#ffffff',
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    marginBottom: 4,
  },
  cardTitle: {
    color: '#1f2937',
    textAlign: 'center',
  },
  cardDate: {
    color: '#64748b',
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    marginTop: 20,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#0f172a',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  addFirstButton: {
    marginTop: 8,
    backgroundColor: '#0891b2',
  },
  addFirstButtonContent: {
    paddingVertical: 8,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: '#0891b2',
  },
  snackbar: {
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
});