import { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text as PaperText, Snackbar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase, isEmailConfirmed } from '@/src/lib/supabase';

export default function LoginScreen() {
  const { registered, confirmation } = useLocalSearchParams<{ 
    registered?: string;
    confirmation?: string;
  }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (registered === 'true') {
      if (confirmation === 'pending') {
        setSuccessMessage('Registrering vellykket! Vennligst bekreft e-postadressen din før du logger inn. Sjekk innboksen din for en bekreftelseslenke.');
      } else {
        setSuccessMessage('Registrering vellykket! Du kan nå logge inn.');
      }
    }
  }, [registered, confirmation]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vennligst fyll ut alle felt');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Feil e-post eller passord');
        }
        throw signInError;
      }

      // Check if email is confirmed
      const emailConfirmed = await isEmailConfirmed();
      if (!emailConfirmed) {
        setError('Du må bekrefte e-postadressen din før du kan logge inn. Sjekk innboksen din for en bekreftelseslenke.');
        return;
      }

      setSuccessMessage('Innlogging vellykket!');
      await supabase.auth.getSession();
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Error logging in:', err);
      setError(err instanceof Error ? err.message : 'Kunne ikke logge inn. Vennligst prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=2070&auto=format&fit=crop' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay}>
          <PaperText variant="displaySmall" style={styles.title}>Masse Tracker</PaperText>
          <PaperText variant="titleMedium" style={styles.subtitle}>Logg inn for å fortsette</PaperText>
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
          returnKeyType="next"
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
          returnKeyType="go"
          onSubmitEditing={handleLogin}
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
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          disabled={loading}
          buttonColor="#0891b2"
          textColor="#ffffff"
        >
          Logg inn
        </Button>

        <Button
          mode="text"
          onPress={handleRegisterRedirect}
          style={styles.linkButton}
          disabled={loading}
          textColor="#0891b2"
        >
          Har du ikke konto? Registrer deg her
        </Button>
      </View>

      <Snackbar
        visible={!!error || !!successMessage}
        onDismiss={() => {
          setError(null);
          setSuccessMessage(null);
        }}
        duration={confirmation === 'pending' ? 8000 : 5000}
        style={[
          styles.snackbar,
          successMessage ? styles.successSnackbar : styles.errorSnackbar
        ]}
      >
        {error || successMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#f0f9ff',
    opacity: 0.9,
  },
  form: {
    padding: 24,
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
  },
  successSnackbar: {
    backgroundColor: '#059669',
  },
  errorSnackbar: {
    backgroundColor: '#dc2626',
  },
});