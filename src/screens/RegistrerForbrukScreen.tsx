import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, TextInput, Text as PaperText } from 'react-native-paper';
import { supabase } from '../lib/supabase';

const RegistrerForbrukScreen = () => {
  const [massetyper, setMassetyper] = useState([]);
  const [prosjekter, setProsjekter] = useState([]);
  const [valgtMassetype, setValgtMassetype] = useState(null);
  const [valgtProsjekt, setValgtProsjekt] = useState(null);
  const [antallSkuffer, setAntallSkuffer] = useState('');

  useEffect(() => {
    hentMassetyper();
    hentProsjekter();
  }, []);

  const hentMassetyper = async () => {
    const { data } = await supabase
      .from('massetyper')
      .select('*')
      .order('navn');
    if (data) setMassetyper(data);
  };

  const hentProsjekter = async () => {
    const { data } = await supabase
      .from('prosjekter')
      .select('*')
      .order('navn');
    if (data) setProsjekter(data);
  };

  const registrerForbruk = async () => {
    if (valgtMassetype && valgtProsjekt && antallSkuffer) {
      const { error } = await supabase
        .from('forbruk')
        .insert([{
          massetype_id: valgtMassetype,
          prosjekt_id: valgtProsjekt,
          antall_skuffer: parseInt(antallSkuffer),
          dato: new Date().toISOString()
        }]);

      if (!error) {
        setAntallSkuffer('');
        // Vis bekreftelse til bruker
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <PaperText variant="titleMedium" style={styles.label}>Velg massetype</PaperText>
        {massetyper.map(m => (
          <Button
            key={m.id}
            mode={valgtMassetype === m.id ? 'contained' : 'outlined'}
            onPress={() => setValgtMassetype(m.id)}
            style={styles.button}
          >
            {m.navn}
          </Button>
        ))}

        <PaperText variant="titleMedium" style={styles.label}>Velg prosjekt</PaperText>
        {prosjekter.map(p => (
          <Button
            key={p.id}
            mode={valgtProsjekt === p.id ? 'contained' : 'outlined'}
            onPress={() => setValgtProsjekt(p.id)}
            style={styles.button}
          >
            {p.navn}
          </Button>
        ))}

        <TextInput
          label="Antall skuffer"
          value={antallSkuffer}
          onChangeText={setAntallSkuffer}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button 
          mode="contained" 
          onPress={registrerForbruk}
          style={styles.submitButton}
        >
          Registrer
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
  },
  button: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default RegistrerForbrukScreen;