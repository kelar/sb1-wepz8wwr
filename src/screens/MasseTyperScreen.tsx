import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, TextInput, List, FAB, Text as PaperText, Surface } from 'react-native-paper';
import { getMassetyper, addMassetype } from '../lib/db';

const MasseTyperScreen = () => {
  const [massetyper, setMassetyper] = useState([]);
  const [nyMassetype, setNyMassetype] = useState('');
  const [visLeggTil, setVisLeggTil] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    hentMassetyper();
  }, []);

  const hentMassetyper = async () => {
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

  const leggTilMassetype = async () => {
    if (nyMassetype.trim()) {
      try {
        await addMassetype(nyMassetype.trim());
        setNyMassetype('');
        setVisLeggTil(false);
        hentMassetyper();
      } catch (err) {
        console.error('Error adding massetype:', err);
        setError('Kunne ikke legge til massetype');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <PaperText variant="headlineMedium" style={styles.title}>Massetyper</PaperText>
        <PaperText variant="bodyLarge" style={styles.subtitle}>Administrer massetyper</PaperText>
      </Surface>

      <FlatList
        data={massetyper}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={() => (
              <PaperText variant="bodyLarge" style={styles.itemText}>
                {item.navn}
              </PaperText>
            )}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            style={styles.listItem}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      {visLeggTil ? (
        <View style={styles.inputContainer}>
          <TextInput
            label="Navn på massetype"
            value={nyMassetype}
            onChangeText={setNyMassetype}
            style={styles.input}
            mode="outlined"
            outlineColor="#94a3b8"
            activeOutlineColor="#0891b2"
            textColor="#0f172a"
          />
          <Button 
            mode="contained" 
            onPress={leggTilMassetype}
            style={styles.saveButton}
            buttonColor="#0891b2"
          >
            Lagre
          </Button>
        </View>
      ) : (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setVisLeggTil(true)}
          color="#ffffff"
          customSize={56}
        />
      )}
    </View>
  );
};

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
  listContent: {
    padding: 16,
  },
  listItem: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  itemText: {
    color: '#0f172a',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  saveButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0891b2',
  },
});

export default MasseTyperScreen;