import { View, StyleSheet } from 'react-native';
import { Button, Surface, Text as PaperText, Portal, Dialog } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { LogOut, User } from 'lucide-react-native';
import { useState } from 'react';

export default function SettingsScreen() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setLoading(true);
      setError(null);

      // First clear local storage
      localStorage.clear();
      
      // Then sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'global'
      });
      
      if (signOutError) throw signOutError;

      // Force navigation to login screen
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Kunne ikke logge ut. Vennligst prøv igjen.');
      setShowLogoutDialog(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <PaperText variant="headlineMedium" style={styles.title}>Innstillinger</PaperText>
        <PaperText variant="bodyLarge" style={styles.subtitle}>Administrer din konto</PaperText>
      </Surface>

      <View style={styles.content}>
        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={24} color="#0f172a" />
            <PaperText variant="titleLarge" style={styles.sectionTitle}>Konto</PaperText>
          </View>
          
          <Button
            mode="contained"
            onPress={() => setShowLogoutDialog(true)}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            icon={() => <LogOut size={20} color="#ffffff" />}
            loading={loading}
            disabled={loading}
          >
            Logg ut
          </Button>

          {error && (
            <PaperText style={styles.errorText}>{error}</PaperText>
          )}
        </Surface>
      </View>

      <Portal>
        <Dialog
          visible={showLogoutDialog}
          onDismiss={() => setShowLogoutDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Bekreft utlogging
          </Dialog.Title>
          <Dialog.Content>
            <PaperText variant="bodyLarge" style={styles.dialogText}>
              Er du sikker på at du vil logge ut?
            </PaperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowLogoutDialog(false)}
              mode="outlined"
              style={styles.dialogButton}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button
              onPress={handleLogout}
              mode="contained"
              style={[styles.dialogButton, styles.dialogConfirmButton]}
              loading={loading}
              disabled={loading}
            >
              Logg ut
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#0f172a',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
  },
  logoutButtonContent: {
    height: 48,
  },
  errorText: {
    color: '#dc2626',
    marginTop: 12,
    textAlign: 'center',
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
  },
  dialogTitle: {
    color: '#0f172a',
    textAlign: 'center',
  },
  dialogText: {
    color: '#334155',
    textAlign: 'center',
  },
  dialogButton: {
    minWidth: 100,
  },
  dialogConfirmButton: {
    backgroundColor: '#dc2626',
  },
});