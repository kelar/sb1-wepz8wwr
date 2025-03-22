/**
 * Footer Component
 * 
 * A simple footer component that displays copyright information.
 * Used across the application to maintain consistent branding.
 */
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.copyright}>© Larsen It Service</Text>
    </View>
  );
}

// Styles for the footer component
const styles = StyleSheet.create({
  footer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyright: {
    color: '#64748b',
    fontSize: 14,
  },
});