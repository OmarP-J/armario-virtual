import { useId, useMemo, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Ellipse, Rect, Path, G, Line } from 'react-native-svg';
import { BodyProfile } from '@/context/fitting-context';
import { SKIN_TONES } from '@/data/demo';

export function Mannequin({ profile, dressed = false, angle = 0, onAngleChange, shirtColor = '#89A5B9', pantsColor = '#B6A080', dark = false }: {
  profile: BodyProfile; dressed?: boolean; angle?: number; onAngleChange: (value: number) => void;
  shirtColor?: string; pantsColor?: string; dark?: boolean;
}) {
  // Los ids de <LinearGradient> se renderizan como ids de <linearGradient> en el DOM real.
  // Si dos maniquíes están montados a la vez (p. ej. la pantalla anterior sigue viva
  // durante la transición del router), un id fijo como "skin" colisiona entre ambos:
  // el navegador resuelve fill="url(#skin)" contra el PRIMER elemento con ese id en
  // todo el documento, así que el segundo maniquí queda invisible o con el color
  // equivocado. useId() nos da un sufijo único por instancia para evitar eso.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const skinId = 'skin-' + uid;
  const shirtId = 'shirt-' + uid;
  const pantsId = 'pants-' + uid;
  const skinFill = 'url(#' + skinId + ')';
  const shirtFill = 'url(#' + shirtId + ')';
  const pantsFill = 'url(#' + pantsId + ')';

  const origin = useRef(0);
  const currentAngle = useRef(angle);
  currentAngle.current = angle;
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: () => { origin.current = currentAngle.current; },
    onPanResponderMove: (_, gesture) => onAngleChange(((origin.current + gesture.dx * 0.9) % 360 + 360) % 360),
  }), [onAngleChange]);
  const cosine = Math.cos(angle * Math.PI / 180);
  const front = cosine >= 0;
  const facing = 0.42 + 0.58 * Math.abs(cosine);
  const build = { Delgada: 0.85, Media: 1, Atlética: 1.12, Robusta: 1.2 }[profile.build] ?? 1;
  const bodyWidth = Math.max(0.8, Math.min(1.3, profile.weight / 100 + 0.36)) * build;
  const shoulderWidth = profile.sex === 'Hombre' ? 1.1 : profile.sex === 'Mujer' ? 0.94 : 1;
  const heightScale = 0.82 + (profile.height - 130) / 400;
  const skin = SKIN_TONES[profile.skin] ?? SKIN_TONES[2];
  const body = dressed ? shirtFill : skinFill;
  const legs = dressed ? pantsFill : skinFill;
  return <View {...responder.panHandlers} style={{ flex: 1, minHeight: 160, width: '100%' }} accessibilityLabel={'Maniquí esquemático, ' + profile.height + ' centímetros, vista ' + (Math.abs(cosine) < 0.4 ? 'de perfil' : front ? 'frontal' : 'trasera')}>
    <Svg width="100%" height="100%" viewBox="0 0 240 370">
      <Defs>
        <LinearGradient id={skinId} x1="0" x2="1" y1="0" y2=".2"><Stop offset="0" stopColor={skin} /><Stop offset=".45" stopColor={skin} /><Stop offset="1" stopColor="#352B22" /></LinearGradient>
        <LinearGradient id={shirtId} x1="0" x2="1"><Stop offset="0" stopColor={shirtColor} /><Stop offset=".65" stopColor={shirtColor} /><Stop offset="1" stopColor="#324754" /></LinearGradient>
        <LinearGradient id={pantsId} x1="0" x2="1"><Stop offset="0" stopColor={pantsColor} /><Stop offset=".6" stopColor={pantsColor} /><Stop offset="1" stopColor="#4E514F" /></LinearGradient>
      </Defs>
      {[95, 205, 320].map(y => <Line key={y} x1="16" x2="224" y1={y} y2={y} stroke={dark ? '#40515E' : '#CBD4DA'} strokeWidth=".7" />)}
      <Ellipse cx="115" cy="338" rx="66" ry="9" fill={dark ? '#0E1E2B' : '#B9BEC0'} />
      <G transform={'translate(120 334) scale(' + facing * bodyWidth + ' ' + heightScale + ') translate(-120 -334)'}>
        <Rect x="94" y="218" width="21" height="111" rx="10" fill={legs} />
        <Rect x="126" y="218" width="21" height="111" rx="10" fill={legs} />
        <Ellipse cx="102" cy="329" rx="15" ry="6" fill={dressed ? '#6B4D39' : '#393C3C'} />
        <Ellipse cx="139" cy="329" rx="15" ry="6" fill={dressed ? '#6B4D39' : '#393C3C'} />
        <Path d="M93 192 Q120 184 148 192 L147 231 Q133 243 120 226 Q105 242 93 231 Z" fill={legs} />
        <G transform={'translate(120 0) scale(' + shoulderWidth + ' 1) translate(-120 0)'}>
          <Rect x="69" y="108" width="18" height="76" rx="9" transform="rotate(7 78 108)" fill={body} />
          <Rect x="153" y="108" width="18" height="76" rx="9" transform="rotate(-7 162 108)" fill={body} />
          <Rect x="61" y="178" width="17" height="63" rx="8" fill={dressed ? skinFill : body} />
          <Rect x="163" y="178" width="17" height="63" rx="8" fill={dressed ? skinFill : body} />
          <Ellipse cx="69" cy="241" rx="9" ry="14" fill={skinFill} />
          <Ellipse cx="171" cy="241" rx="9" ry="14" fill={skinFill} />
          <Path d="M88 99 Q120 85 152 99 L148 158 L143 191 Q120 203 97 191 L92 157 Z" fill={body} />
          {dressed && front && <><Path d="M106 99 L120 113 L134 99 M120 113 L120 194" fill="none" stroke="#263E4F" strokeOpacity=".3" />{[128, 148, 168, 188].map(y => <Ellipse key={y} cx="123" cy={y} rx="1" ry="1" fill="#EEF2F4" />)}</>}
        </G>
        <Rect x="110" y="77" width="20" height="23" rx="8" fill={skinFill} />
        <Ellipse cx="120" cy="57" rx="22" ry="29" fill={skinFill} />
        {!dressed && <><Ellipse cx="120" cy="146" rx="12" ry="22" fill="#F7EAD4" opacity=".09" /><Line x1="95" x2="145" y1="193" y2="193" stroke="#513D2B" strokeOpacity=".3" /></>}
      </G>
    </Svg>
  </View>;
}
