import { View } from 'react-native';
import { Label, palette, Title } from './fit-ui';
import type { MeasurementProps } from './measurement';
export function Measurement({ label, value, min, max, unit, onChange }: MeasurementProps) {
  return <View style={{ gap: 10, marginBottom: 20 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Label style={{ color: palette.muted }}>{label}</Label><Title style={{ fontSize: 20, lineHeight: 25, textTransform: 'none' }}>{value} {unit}</Title></View>
    <input aria-label={label} aria-valuetext={value + ' ' + unit} type="range" min={min} max={max} step={1} value={value} onChange={event => onChange(Number(event.target.value))} style={{ accentColor: palette.blue, width: '100%', margin: 0, height: 24, cursor: 'pointer' }} />
  </View>;
}
