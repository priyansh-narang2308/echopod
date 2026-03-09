import { View, Text, Image, Pressable, Dimensions, Animated } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { usePlayer } from '@/providers/player-provider';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width * 0.8;

type MarqueeTextProps = {
  text: string;
  style?: object;
  className?: string;
};

function MarqueeText({ text, style }: MarqueeTextProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const overflow = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    if (!overflow) {
      translateX.setValue(0);
      return;
    }
    const distance = textWidth - containerWidth + 24;
    const run = () => {
      animRef.current = Animated.sequence([
        Animated.delay(1200),
        Animated.timing(translateX, {
          toValue: -distance,
          duration: distance * 22,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
      animRef.current.start(({ finished }) => { if (finished) run(); });
    };
    run();
    return () => animRef.current?.stop();
  }, [overflow, textWidth, containerWidth]);

  return (
    <View
      style={{ overflow: 'hidden' }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Animated.Text
        style={[style, { transform: [{ translateX }] }]}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const EpisodePlayer = () => {
  const { episode } = usePlayer();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!episode) return <Redirect href="/home" />;

  const artwork = episode.image || episode.feedImage || '';

  const durationLabel = episode.duration
    ? `-${Math.floor(episode.duration / 60)}:${String(episode.duration % 60).padStart(2, '0')}`
    : '--:--';

  return (
    <View className="flex-1 bg-[#1a0500]">
      <Image
        source={{ uri: artwork }}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.65 }]}
        blurRadius={80}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.92)']}
        style={StyleSheet.absoluteFillObject}
      />

      <View
        style={{ paddingTop: insets.top + 8 }}
        className="flex-row items-center justify-between px-5 pb-3"
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-60"
        >
          <Ionicons name="chevron-down" size={26} color="#fff" />
        </Pressable>

        <Text className="text-white/50 text-[11px] font-bold tracking-[2px]">
          NOW PLAYING
        </Text>

        <Pressable className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-60">
          <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
        </Pressable>
      </View>

      <View className="items-center mt-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.8, shadowRadius: 36 }}>
        <View style={{ width: ARTWORK_SIZE, height: ARTWORK_SIZE, borderRadius: 20, overflow: 'hidden', backgroundColor: '#2a1008' }}>
          {artwork ? (
            <Image
              source={{ uri: artwork }}
              style={{ width: ARTWORK_SIZE, height: ARTWORK_SIZE }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="headset" size={80} color="rgba(255,255,255,0.15)" />
            </View>
          )}
        </View>
      </View>

      <View
        className="flex-1 px-6 justify-between"
        style={{ paddingTop: 28, paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row items-center gap-3">
          <Image
            source={{ uri: artwork }}
            className="w-12 h-12 rounded-xl"
            resizeMode="cover"
          />
          <View className="flex-1">
            <MarqueeText
              text={episode.title}
              style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}
            />
            <Text className="text-white/50 text-[13px] font-medium mt-0.5" numberOfLines={1}>
              {episode.feedTitle}
            </Text>
          </View>
          <Pressable className="active:opacity-60">
            <Ionicons name="add-circle-outline" size={28} color="rgba(255,255,255,0.75)" />
          </Pressable>
        </View>

        <View className="gap-1">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={episode.duration ?? 100}
            value={0}
            minimumTrackTintColor="#ffffff"
            maximumTrackTintColor="rgba(255,255,255,0.25)"
            thumbTintColor="#ffffff"
          />
          <View className="flex-row justify-between -mt-1">
            <Text className="text-white/40 text-xs font-semibold">0:00</Text>
            <Text className="text-white/40 text-xs font-semibold">{durationLabel}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Pressable className="w-11 h-11 items-center justify-center active:opacity-60">
            <Text className="text-white text-[16px] font-bold">1×</Text>
          </Pressable>
          <Pressable className="items-center justify-center relative active:opacity-60">
            <Ionicons name="play-back-circle-outline" size={54} color="#fff" />
            <Text className="absolute text-white text-[9px] font-black">15</Text>
          </Pressable>
          <Pressable
            className="w-[72px] h-[72px] rounded-full bg-white/15 border border-white/30 items-center justify-center active:opacity-80"
          >
            <Ionicons name="play" size={34} color="#fff" />
          </Pressable>

          <Pressable className="items-center justify-center relative active:opacity-60">
            <Ionicons name="play-forward-circle-outline" size={54} color="#fff" />
            <Text className="absolute text-white text-[9px] font-black">30</Text>
          </Pressable>

          <Pressable className="w-11 h-11 items-center justify-center active:opacity-60">
            <Ionicons name="moon-outline" size={22} color="#fff" />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2">
          <Ionicons name="volume-low" size={18} color="rgba(255,255,255,0.4)" />
          <Slider
            style={{ flex: 1, height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={0.65}
            minimumTrackTintColor="rgba(255,255,255,0.8)"
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor="#ffffff"
          />
          <Ionicons name="volume-high" size={18} color="rgba(255,255,255,0.4)" />
        </View>

        <View className="flex-row justify-around items-center pt-4 border-t border-white/10">
          <Pressable className="active:opacity-60">
            <Ionicons name="chatbubble-outline" size={25} color="rgba(255,255,255,0.6)" />
          </Pressable>
          <Pressable className="active:opacity-60">
            <Ionicons name="radio-outline" size={27} color="rgba(255,255,255,0.6)" />
          </Pressable>
          <Pressable className="active:opacity-60">
            <Ionicons name="list-outline" size={25} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default EpisodePlayer;