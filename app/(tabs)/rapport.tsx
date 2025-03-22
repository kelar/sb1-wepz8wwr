import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, DataTable, ActivityIndicator, Divider, Portal, Dialog, Text as PaperText, IconButton, Surface } from 'react-native-paper';
import { Scale, Truck, FileSpreadsheet, FilePen as FilePdf, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { getForbrukByMonth, getMonthlyStats, subscribeToDataChanges, updateForbruk } from '../../src/lib/db';
import { exportToPDF, exportToExcel } from '../../src/utils/export';

export default function RapportScreen() {
  const [forbrukData, setForbrukData] = useState([]);
  const [stats, setStats] = useState({ massetypeStats: [], prosjektStats: [] });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const monthNames = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
  ];

  useEffect(() => {
    fetchData();

    // Subscribe to data changes
    const unsubscribe = subscribeToDataChanges(() => {
      fetchData();
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [forbruk, monthlyStats] = await Promise.all([
        getForbrukByMonth(
          selectedDate.getFullYear(),
          selectedDate.getMonth()
        ),
        getMonthlyStats(
          selectedDate.getFullYear(),
          selectedDate.getMonth()
        )
      ]);
      setForbrukData(forbruk || []);
      setStats(monthlyStats);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Kunne ikke hente data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    const now = new Date();
    if (newDate <= now) {
      setSelectedDate(newDate);
    }
  };

  const handleIncrement = async (item) => {
    try {
      setUpdatingId(item.id);
      await updateForbruk(item.id, item.antall_skuffer + 1);
      await fetchData();
    } catch (err) {
      console.error('Error updating forbruk:', err);
      setError('Kunne ikke oppdatere antall');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecrement = async (item) => {
    if (item.antall_skuffer <= 1) return;
    
    try {
      setUpdatingId(item.id);
      await updateForbruk(item.id, item.antall_skuffer - 1);
      await fetchData();
    } catch (err) {
      console.error('Error updating forbruk:', err);
      setError('Kunne ikke oppdatere antall');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      setExporting(true);
      setShowExportDialog(false);

      const totalSkuffer = stats.massetypeStats.reduce((sum, stat) => sum + Number(stat.sum_skuffer), 0);
      const totalWeight = stats.massetypeStats.reduce((sum, stat) => sum + Number(stat.total_weight || 0), 0);

      const exportData = {
        month: `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`,
        massetypeStats: stats.massetypeStats,
        prosjektStats: stats.prosjektStats,
        forbrukData,
        totalSkuffer,
        totalWeight
      };

      if (type === 'pdf') {
        await exportToPDF(exportData);
      } else {
        await exportToExcel(exportData);
      }
    } catch (err) {
      console.error('Error exporting:', err);
      setError('Kunne ikke eksportere rapport');
    } finally {
      setExporting(false);
    }
  };

  const totalSkuffer = stats.massetypeStats.reduce((sum, stat) => sum + Number(stat.sum_skuffer), 0);
  const totalWeight = stats.massetypeStats.reduce((sum, stat) => sum + Number(stat.total_weight || 0), 0);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0891b2" />
        <PaperText style={styles.loadingText}>Laster rapport...</PaperText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <PaperText style={styles.errorText}>{error}</PaperText>
        <Button 
          mode="contained" 
          onPress={fetchData}
          style={styles.retryButton}
        >
          Prøv igjen
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.monthSelector}>
          <IconButton
            icon={() => <ChevronLeft size={24} color="#0f172a" />}
            onPress={handlePreviousMonth}
          />
          <PaperText variant="headlineMedium" style={styles.title}>
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </PaperText>
          <IconButton
            icon={() => <ChevronRight size={24} color={selectedDate < new Date() ? "#0f172a" : "#cbd5e1"} />}
            onPress={handleNextMonth}
            disabled={selectedDate >= new Date()}
          />
        </View>
      </Surface>

      <View style={styles.content}>
        <View style={styles.summaryCards}>
          <Card style={[styles.summaryCard, styles.halfCard]}>
            <Card.Content style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Truck size={32} color="#0891b2" />
                <PaperText variant="headlineMedium" style={styles.summaryTitle}>{totalSkuffer}</PaperText>
                <PaperText variant="bodyMedium" style={styles.summaryLabel}>Antall skuffer</PaperText>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.summaryCard, styles.halfCard]}>
            <Card.Content style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Scale size={32} color="#0891b2" />
                <PaperText variant="headlineMedium" style={styles.summaryTitle}>
                  {totalWeight.toLocaleString('no-NO', { maximumFractionDigits: 0 })}
                </PaperText>
                <PaperText variant="bodyMedium" style={styles.summaryLabel}>Total vekt (kg)</PaperText>
              </View>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.statsCard}>
          <Card.Content>
            <PaperText variant="titleLarge" style={styles.sectionTitle}>Fordeling per massetype</PaperText>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title>
                  <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Massetype</PaperText>
                </DataTable.Title>
                <DataTable.Title numeric>
                  <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Antall</PaperText>
                </DataTable.Title>
                <DataTable.Title numeric>
                  <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Vekt/skuff</PaperText>
                </DataTable.Title>
                <DataTable.Title numeric>
                  <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Total vekt</PaperText>
                </DataTable.Title>
              </DataTable.Header>

              {stats.massetypeStats.map((stat) => (
                <DataTable.Row key={stat.massetyper.id}>
                  <DataTable.Cell>
                    <PaperText style={styles.tableCell}>{stat.massetyper.navn}</PaperText>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <PaperText style={styles.tableCell}>{stat.sum_skuffer}</PaperText>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <PaperText style={styles.tableCell}>
                      {stat.massetyper.weight_per_skuff
                        ? stat.massetyper.weight_per_skuff.toLocaleString('no-NO')
                        : '-'
                      }
                    </PaperText>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <PaperText style={styles.tableCell}>
                      {stat.total_weight
                        ? stat.total_weight.toLocaleString('no-NO', { maximumFractionDigits: 0 })
                        : '-'
                      }
                    </PaperText>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}

              <DataTable.Row style={styles.totalRow}>
                <DataTable.Cell>
                  <PaperText style={styles.totalCell}>Total</PaperText>
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  <PaperText style={styles.totalCell}>{totalSkuffer}</PaperText>
                </DataTable.Cell>
                <DataTable.Cell>
                  <PaperText style={styles.totalCell} />
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  <PaperText style={styles.totalCell}>
                    {totalWeight.toLocaleString('no-NO', { maximumFractionDigits: 0 })}
                  </PaperText>
                </DataTable.Cell>
              </DataTable.Row>
            </DataTable>

            <Divider style={styles.divider} />

            <PaperText variant="titleLarge" style={styles.sectionTitle}>Fordeling per prosjekt</PaperText>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title>
                  <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Prosjekt</PaperText>
                </DataTable.Title>
                <DataTable.Title numeric>
                  <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Antall skuffer</PaperText>
                </DataTable.Title>
              </DataTable.Header>

              {stats.prosjektStats.map((stat) => (
                <DataTable.Row key={stat.prosjekter.id}>
                  <DataTable.Cell>
                    <PaperText style={styles.tableCell}>{stat.prosjekter.navn}</PaperText>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <PaperText style={styles.tableCell}>{stat.sum_skuffer}</PaperText>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>

        <Card style={styles.tableCard}>
          <Card.Content>
            <PaperText variant="titleLarge" style={styles.sectionTitle}>Detaljert oversikt</PaperText>
            {forbrukData.length === 0 ? (
              <PaperText style={styles.emptyText}>Ingen registreringer denne måneden</PaperText>
            ) : (
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title style={styles.columnDate}>
                    <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Dato</PaperText>
                  </DataTable.Title>
                  <DataTable.Title style={styles.columnMassetype}>
                    <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Massetype</PaperText>
                  </DataTable.Title>
                  <DataTable.Title style={styles.columnProsjekt}>
                    <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Prosjekt</PaperText>
                  </DataTable.Title>
                  <DataTable.Title numeric style={styles.columnAntall}>
                    <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Antall</PaperText>
                  </DataTable.Title>
                  <DataTable.Title style={styles.columnEndre}>
                    <PaperText variant="bodyMedium" style={styles.tableHeaderText}>Endre</PaperText>
                  </DataTable.Title>
                </DataTable.Header>

                {forbrukData.map((item) => (
                  <DataTable.Row key={item.id}>
                    <DataTable.Cell style={styles.columnDate}>
                      <PaperText style={styles.tableCell}>
                        {new Date(item.dato).toLocaleDateString('no-NO')}
                      </PaperText>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnMassetype}>
                      <PaperText style={styles.tableCell}>{item.massetyper.navn}</PaperText>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnProsjekt}>
                      <PaperText style={styles.tableCell}>{item.prosjekter.navn}</PaperText>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.columnAntall}>
                      <PaperText style={styles.tableCell}>{item.antall_skuffer}</PaperText>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnEndre}>
                      <View style={styles.counterButtons}>
                        <IconButton
                          icon={() => <Minus size={20} color={item.antall_skuffer <= 1 ? '#cbd5e1' : '#64748b'} />}
                          mode="outlined"
                          onPress={() => handleDecrement(item)}
                          disabled={updatingId === item.id || item.antall_skuffer <= 1}
                          style={[
                            styles.counterButton,
                            updatingId === item.id && styles.disabledButton
                          ]}
                        />
                        <IconButton
                          icon={() => <Plus size={20} color={updatingId === item.id ? '#cbd5e1' : '#0891b2'} />}
                          mode="outlined"
                          onPress={() => handleIncrement(item)}
                          disabled={updatingId === item.id}
                          style={[
                            styles.counterButton,
                            updatingId === item.id && styles.disabledButton
                          ]}
                        />
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            )}
          </Card.Content>
        </Card>

        <Button 
          mode="contained" 
          onPress={() => setShowExportDialog(true)}
          style={styles.exportButton}
          loading={exporting}
          disabled={exporting}
          icon={() => <FileSpreadsheet size={20} color="#ffffff" />}
        >
          Eksporter Rapport
        </Button>
      </View>

      <Portal>
        <Dialog 
          visible={showExportDialog} 
          onDismiss={() => setShowExportDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Velg eksportformat
          </Dialog.Title>
          <Dialog.Content>
            <PaperText variant="bodyLarge" style={styles.dialogText}>
              Velg hvilket format du vil eksportere rapporten i.
            </PaperText>
            <View style={styles.exportOptions}>
              <Button 
                onPress={() => handleExport('excel')}
                mode="outlined"
                icon={() => <FileSpreadsheet size={20} color="#2563eb" />}
                style={styles.exportButton}
                contentStyle={styles.exportButtonContent}
                loading={exporting}
                disabled={exporting}
              >
                Excel
              </Button>
              <Button 
                onPress={() => handleExport('pdf')}
                mode="contained"
                icon={() => <FilePdf size={20} color="#ffffff" />}
                style={[styles.exportButton, styles.exportPrimaryButton]}
                contentStyle={styles.exportButtonContent}
                loading={exporting}
                disabled={exporting}
              >
                PDF
              </Button>
            </View>
          </Dialog.Content>
        </Dialog>
      </Portal>
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
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    color: '#0f172a',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
  },
  halfCard: {
    flex: 1,
  },
  summaryContent: {
    padding: 16,
  },
  summaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    color: '#0f172a',
  },
  summaryLabel: {
    color: '#475569',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#0f172a',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 24,
    backgroundColor: '#e2e8f0',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  tableCell: {
    color: '#334155',
  },
  totalRow: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalCell: {
    color: '#0f172a',
    fontWeight: '600',
  },
  columnDate: {
    flex: 1,
  },
  columnMassetype: {
    flex: 2,
  },
  columnProsjekt: {
    flex: 2,
  },
  columnAntall: {
    flex: 0.8,
    paddingRight: 24,
  },
  columnEndre: {
    flex: 1.2,
    justifyContent: 'flex-end',
  },
  counterButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  counterButton: {
    margin: 0,
    borderColor: '#94a3b8',
    width: 40,
    height: 40,
  },
  disabledButton: {
    opacity: 0.5,
  },
  exportButton: {
    marginTop: 8,
    backgroundColor: '#2563eb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#475569',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0891b2',
  },
  emptyText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  dialogTitle: {
    color: '#0f172a',
    textAlign: 'center',
    marginVertical: 16,
  },
  dialogText: {
    color: '#334155',
    textAlign: 'center',
    marginBottom: 24,
  },
  exportOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  exportButton: {
    flex: 1,
    borderColor: '#2563eb',
  },
  exportButtonContent: {
    flexDirection: 'row-reverse',
    paddingVertical: 8,
  },
  exportPrimaryButton: {
    backgroundColor: '#2563eb',
  },
});