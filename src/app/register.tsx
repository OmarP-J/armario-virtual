import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Action, Copy, Heading, Label, palette, Screen, ui } from '@/components/fit-ui';
import { useAuth } from '@/context/auth-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Heading eyebrow="Fit Engine" title="Crear cuenta" subtitle="Un minuto y ya tienes tu armario listo." back />

      <View style={ui.section}>
        <Label style={{ color: palette.muted }}>Nombre</Label>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={palette.muted}
          autoComplete="name"
          style={ui.input}
        />
      </View>

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
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor={palette.muted}
          secureTextEntry
          autoComplete="password-new"
          style={ui.input}
        />
      </View>

      <View style={ui.section}>
        <Label style={{ color: palette.muted }}>Confirmar contraseña</Label>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repite tu contraseña"
          placeholderTextColor={palette.muted}
          secureTextEntry
          autoComplete="password-new"
          style={ui.input}
        />
      </View>

      {error ? <Copy style={ui.error}>{error}</Copy> : null}

      <View style={ui.section}>
        <Action onPress={handleRegister} disabled={loading}>{loading ? 'Creando…' : 'Crear cuenta'}</Action>
        <Action outline onPress={() => (router.canGoBack() ? router.back() : router.push('/login'))}>Ya tengo cuenta</Action>
      </View>

      <Copy style={{ fontSize: 11 }}>Tu cuenta se guarda solo en este dispositivo — todavía no hay un servidor detrás.</Copy>
    </Screen>
  );
}
