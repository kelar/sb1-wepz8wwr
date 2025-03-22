import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { DataTable, Button, Text as PaperText } from 'react-native-paper';
import { supabase } from '../lib/supabase';

const RapportScreen = () => {
  const [rapportData, setRapportData] = useState([]);
  const [måned, setMåned] = useState(new Date().getMonth());
  const [år, setÅr] = useState(new Date().getFullYear());

  useEffect(() => {
    hentRapportData();
  }, [måned, år]);

  const hentRapportData = async () => {
    const startDato = new Date(år, måned, 1).toISOString();
    const sluttDato = new Date(år, måned + 1, 0).toISOString();

    const { data } = await supabase
      .from('forbruk')
      .select(`
        antall_skuffer,
        massetyper (navn),
        prosjekter (navn)
      `)
      .gte('dato', startDato)
      .lt('dato', sluttDato);

    if (data) {
      const aggregertData = data.reduce((acc, curr) => {
        const key = `${curr.massetyper.navn}-${curr.prosjekter.navn}`;
        if (!acc[key]) {
          acc[key] = {
            massetype: curr.massetyper.navn,
            prosjekt: curr.prosjekter.navn,
            totalSkuffer: 0
          };
        }
        acc[key].totalSkuffer += curr.antall_skuffer;
        return acc;
      }, {});

      setRapportData(Object.values(aggregertData));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <PaperText variant="headlineMedium" style={styles.title}>
        Månedsrapport - {new Date(år, måned).toLocaleString('no-NO', { month: 'long', year: 'numeric' })}
      </PaperText>

      <DataTable>
        <DataTable.Header>
          <DataTable.Title>
            <PaperText>Massetype</PaperText>
          </DataTable.Title>
          <DataTable.Title>
            <PaperText>Prosjekt</PaperText>
          </DataTable.Title>
          <DataTable.Title numeric>
            <PaperText>Antall Skuffer</PaperText>
          </DataTable.Title>
        </DataTable.Header>

        {rapportData.map((rad, index) => (
          <DataTable.Row key={index}>
            <DataTable.Cell>
              <PaperText>{rad.massetype}</PaperText>
            </DataTable.Cell>
            <DataTable.Cell>
              <PaperText>{rad.prosjekt}</PaperText>
            </DataTable.Cell>
            <DataTable.Cell numeric>
              <PaperText>{rad.totalSkuffer}</PaperText>
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={() => {
            // Implementer eksport/deling av rapport
          }}
        >
          Del Rapport
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
    paddingBottom: 24,
  },
});

export default RapportScreen;