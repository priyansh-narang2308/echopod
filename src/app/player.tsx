import {
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { usePlayer } from '@/providers/player-provider';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useAudioPlayerStatus } from 'expo-audio';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width * 0.78;

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

function MarqueeText({ text, style }: { text: string; style?: object }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const overflow = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    if (!overflow) { translateX.setValue(0); return; }
    const distance = textWidth - containerWidth + 24;
    const run = () => {
      animRef.current = Animated.sequence([
        Animated.delay(1200),
        Animated.timing(translateX, { toValue: -distance, duration: distance * 22, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(translateX, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]);
      animRef.current.start(({ finished }) => { if (finished) run(); });
    };
    run();
    return () => animRef.current?.stop();
  }, [overflow, textWidth, containerWidth]);

  return (
    <View style={{ overflow: 'hidden' }} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <Animated.Text style={[style, { transform: [{ translateX }] }]} onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}>
        {text}
      </Animated.Text>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(secs: number): string {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Player Screen ────────────────────────────────────────────────────────────
const EpisodePlayer = () => {
  const { episode, player, togglePlayback, playNext, playPrev, setSpeed, speed } = usePlayer();
  const status = useAudioPlayerStatus(player);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Local slider state — we track the thumb independently while scrubbing
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [volume, setVolume] = useState(1);

  // Volume is set directly on the player object
  const handleVolumeChange = useCallback((val: number) => {
    setVolume(val);
    player.volume = val;
  }, [player]);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekChange = useCallback((val: number) => {
    setSeekValue(val);
  }, []);

  const handleSeekComplete = useCallback((val: number) => {
    player.seekTo(val);
    setIsSeeking(false);
  }, [player]);

  const skip = useCallback((secs: number) => {
    const current = status.currentTime ?? 0;
    const target = Math.max(0, current + secs);
    player.seekTo(target);
  }, [player, status.currentTime]);

  const cycleSpeed = useCallback(() => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
  }, [speed, setSpeed]);

  if (!episode) return <Redirect href="/home" />;

  const artwork = episode.image || episode.feedImage || '';
  const duration = status.duration ?? episode.duration ?? 0;
  const currentTime = isSeeking ? seekValue : (status.currentTime ?? 0);
  const progress = duration > 0 ? currentTime / duration : 0;

  const remaining = duration - currentTime;

  return (
    <View style={styles.root}>
      {/* Blurred artwork background */}
      {!!artwork && (
        <Image
          source={{ uri: artwork }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}
          blurRadius={80}
          resizeMode="cover"
        />
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.94)']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-down" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.nowPlaying}>NOW PLAYING</Text>
      </View>

      <View style={styles.artworkWrapper}>
        <View style={[styles.artworkContainer, { transform: [{ scale: status.playing ? 1 : 0.93 }] }]}>
          {artwork ? (
            <Image source={{ uri: artwork }} style={styles.artwork} resizeMode="cover" />
          ) : (
            <View style={styles.artworkFallback}>
              <Ionicons name="headset" size={80} color="rgba(255,255,255,0.15)" />
            </View>
          )}
        </View>
      </View>

      {/* Info + Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>

        {/* Episode title & podcast name */}
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <MarqueeText text={episode.title} style={styles.episodeTitle} />
            <Text style={styles.feedTitle} numberOfLines={1}>{episode.feedTitle}</Text>
          </View>
        </View>

        {/* Progress Slider */}
        <View style={styles.sliderBlock}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration > 0 ? duration : 1}
            value={currentTime}
            onSlidingStart={handleSeekStart}
            onValueChange={handleSeekChange}
            onSlidingComplete={handleSeekComplete}
            minimumTrackTintColor="#ffffff"
            maximumTrackTintColor="rgba(255,255,255,0.22)"
            thumbTintColor="#ffffff"
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeLabel}>-{formatTime(remaining)}</Text>
          </View>
        </View>

        {/* Transport Controls */}
        <View style={styles.transport}>
          {/* Speed */}
          <Pressable onPress={cycleSpeed} style={styles.sideBtn} hitSlop={10}>
            <Text style={styles.speedText}>{speed % 1 === 0 ? `${speed}×` : `${speed}×`}</Text>
          </Pressable>

          {/* Skip back 15s */}
          <Pressable onPress={() => skip(-15)} style={styles.skipBtn} hitSlop={8}>
            <Ionicons name="play-back" size={28} color="#fff" />
            <Text style={styles.skipLabel}>15</Text>
          </Pressable>

          {/* Play / Pause */}
          <Pressable onPress={togglePlayback} style={styles.playBtn}>
            <Ionicons name={status.playing ? 'pause' : 'play'} size={34} color="#fff" />
          </Pressable>

          {/* Skip forward 30s */}
          <Pressable onPress={() => skip(30)} style={styles.skipBtn} hitSlop={8}>
            <Ionicons name="play-forward" size={28} color="#fff" />
            <Text style={styles.skipLabel}>30</Text>
          </Pressable>

          {/* Next episode */}
          <Pressable onPress={playNext} style={styles.sideBtn} hitSlop={10}>
            <Ionicons name="play-skip-forward" size={26} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>

        {/* Volume */}
        <View style={styles.volumeRow}>
          <Ionicons name="volume-low" size={18} color="rgba(255,255,255,0.4)" />
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor="rgba(255,255,255,0.85)"
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor="#fff"
          />
          <Ionicons name="volume-high" size={18} color="rgba(255,255,255,0.4)" />
        </View>

      </View>
    </View>
  );
};

export default EpisodePlayer;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a0500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowPlaying: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  artworkWrapper: {
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.8,
    shadowRadius: 36,
  },
  artworkContainer: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2a1008',
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  },
  artworkFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
    gap: 4,
  },
  episodeTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  feedTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '500',
  },
  sliderBlock: {
    gap: 2,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -6,
    paddingHorizontal: 2,
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  skipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 50,
    height: 50,
  },
  skipLabel: {
    position: 'absolute',
    bottom: 5,
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
});