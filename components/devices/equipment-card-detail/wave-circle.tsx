import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import Svg, { Circle, ClipPath, Defs, G, Path } from "react-native-svg";

type Props = {
  size: number;               // outer diameter in px
  progress: number;           // 0..1 fill level
  waveAmplitude?: number;     // px
  waveFrequency?: number;     // number of waves across width
  speed?: number;             // cycles per second
  color?: string;             // wave color
  backgroundColor?: string;   // circle background
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function WaveCircle({
  size,
  progress,
  waveAmplitude = 12,
  waveFrequency = 2,
  speed = 0.4,
  color = "#FBE40E",
  backgroundColor = "#E6F0FA",
}: Props) {
  const width = size;
  const height = size;
  const radius = size / 2;
  const half = size / 2;

  // phase drives horizontal movement of wave
  const phase = useSharedValue(0);

  // animate phase continuously
  React.useEffect(() => {
    phase.value = withRepeat(
      withTiming(1, {
        duration: Math.max(2000 / speed, 300),
        easing: Easing.linear,
      }),
      -1,
      false
    );
    return () => cancelAnimation(phase);
  }, [phase, speed]);

  // target height for the wave (y coordinate where wave center sits)
  const targetFillY = half + (1 - Math.max(0, Math.min(1, progress))) * size - size / 2;

  // shared value for vertical offset (smooth transition when progress changes)
  const vertical = useSharedValue(targetFillY);
  React.useEffect(() => {
    vertical.value = withTiming(targetFillY, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [progress, targetFillY, vertical]);

  // produce path string for a sine wave across the width
  const animatedProps = useAnimatedProps(() => {
    const phaseShift = phase.value * Math.PI * 2;
    const amp = waveAmplitude;
    const freq = waveFrequency;
    const yOffset = vertical.value;

    const segments = 64; // controls smoothness
    const dx = width / segments;
    let d = `M 0 ${height} L 0 ${yOffset} `;

    for (let i = 0; i <= segments; i++) {
      const x = i * dx;
      // normalized x in [0, 2π*freq]
      const t = (i / segments) * (Math.PI * 2 * freq) + phaseShift;
      const y = yOffset + Math.sin(t) * amp;
      d += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
    }

    d += `L ${width} ${height} Z`;
    return {
      d,
    } as any;
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={width} height={height}>
        <Defs>
          <ClipPath id="clip">
            <Circle cx={half} cy={half} r={radius} />
          </ClipPath>
        </Defs>

        {/* background circle */}
        <G>
          <Circle cx={half} cy={half} r={radius} fill={backgroundColor} />
        </G>

        {/* clipped wave group */}
        <G clipPath="url(#clip)">
          <AnimatedPath animatedProps={animatedProps} fill={color} opacity={0.9} />
        </G>

        {/* circle outline (optional) */}
        <Circle
          cx={half}
          cy={half}
          r={radius}
          fill="none"
          stroke="#F0DC2D"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({});
