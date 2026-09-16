import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Action, Copy, Heading, Label, palette, Screen, ui } from '@/components/fit-ui';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Heading eyebrow="Fit Engine" title="Iniciar sesión" subtitle="Entra para ver tu armario y tus fits." />

      <View style={ui.section}>
        <Label style={{ color: palette.muted }}>Correo</Label>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="tucorreo@ejemplo.com"
          placeholderTextColor={palette.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          style={ui.input}
        />
      </View>

      <View style={ui.section}>
        <Label style={{ color: palette.muted }}>Contraseña</Label>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={palette.muted}
          secureTextEntry
          autoComplete="password"
          style={ui.input}
        />
      </View>

      {error ? <Copy style={ui.error}>{error}</Copy> : null}

      <View style={ui.section}>
        <Action onPress={handleLogin} disabled={loading}>{loading ? 'Entrando…' : 'Iniciar sesión'}</Action>
        <Action outline onPress={() => router.push('/register')}>Crear una cuenta</Action>
      </View>

      <Copy style={{ fontSize: 11 }}>Tu cuenta se guarda solo en este dispositivo — todavía no hay un servidor detrás.</Copy>
    </Screen>
  );
}
