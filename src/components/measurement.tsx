import Slider from '@react-native-community/slider';
import { View } from 'react-native';
import { Label, palette, Title } from './fit-ui';
export type MeasurementProps = { label: string; value: number; min: number; max: number; unit: string; onChange: (value: number) => void };
export function Measurement({ label, value, min, max, unit, onChange }: MeasurementProps) {
  return <View style={{ gap: 10, marginBottom: 20 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Label style={{ color: palette.muted }}>{label}</Label><Title style={{ fontSize: 20, lineHeight: 25, textTransform: 'none' }}>{value} {unit}</Title></View>
    <Slider accessibilityLabel={label} minimumValue={min} maximumValue={max} value={value} step={1} minimumTrackTintColor={palette.blue} maximumTrackTintColor={palette.line} thumbTintColor={palette.blue} onValueChange={onChange} />
  </View>;
}
