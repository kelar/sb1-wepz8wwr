import { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text as PaperText, Snackbar } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase } from '@/src/lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Vennligst fyll ut alle felt');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passordene må være like');
      return;
    }

    try {
      setLoading(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            email_confirmed: false
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || 
            signUpError.message.includes('already exists') ||
            signUpError.message.includes('user_already_exists')) {
          setShowLoginPrompt(true);
          setError('En bruker med denne e-postadressen finnes allerede');
          return;
        }
        throw signUpError;
      }

      if (data?.user) {
        // Clear any existing session
        await supabase.auth.signOut();
        router.replace('/login?registered=true&confirmation=pending');
      }
    } catch (err) {
      console.error('Error registering:', err);
      setError('Kunne ikke opprette konto. Vennligst prøv igjen senere.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay}>
          <PaperText variant="headlineLarge" style={styles.title}>Opprett konto</PaperText>
          <PaperText variant="titleMedium" style={styles.subtitle}>Registrer deg for å komme i gang</PaperText>
        </View>
      </View>

      <View style={styles.form}>
        <TextInput
          label="E-post"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          disabled={loading}
          mode="outlined"
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
          label="Passord"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          disabled={loading}
          mode="outlined"
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
          label="Bekreft passord"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          disabled={loading}
          mode="outlined"
          outlineColor="#94a3b8"
          activeOutlineColor="#0891b2"
          textColor="#0f172a"
          theme={{
            colors: {
              onSurfaceVariant: '#64748b',
            },
          }}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
          loading={loading}
          disabled={loading}
          buttonColor="#0891b2"
        >
          Registrer deg
        </Button>

        <Button
          mode="text"
          onPress={handleLoginRedirect}
          style={styles.linkButton}
          disabled={loading}
          textColor="#0891b2"
        >
          Har du allerede en konto? Logg inn her
        </Button>
      </View>

      {showLoginPrompt && (
        <View style={styles.promptContainer}>
          <PaperText style={styles.promptText}>
            Vil du logge inn med denne e-postadressen i stedet?
          </PaperText>
          <View style={styles.promptButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowLoginPrompt(false)}
              style={styles.promptButton}
              textColor="#64748b"
            >
              Avbryt
            </Button>
            <Button
              mode="contained"
              onPress={handleLoginRedirect}
              style={[styles.promptButton, styles.promptPrimaryButton]}
              buttonColor="#0891b2"
            >
              Gå til innlogging
            </Button>
          </View>
        </View>
      )}

      <Snackbar
        visible={!!error && !showLoginPrompt}
        onDismiss={() => setError(null)}
        duration={5000}
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
    height: 240,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    color: '#ffffff',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ffffff',
    opacity: 0.9,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 8,
  },
  snackbar: {
    marginBottom: 20,
    backgroundColor: '#dc2626',
  },
  promptContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  promptText: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  promptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  promptButton: {
    flex: 1,
  },
  promptPrimaryButton: {
    backgroundColor: '#0891b2',
  },
});