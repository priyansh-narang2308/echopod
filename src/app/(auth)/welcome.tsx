import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MaskedView from '@react-native-masked-view/masked-view';

const videoSource = require('../../../assets/welcomevideo.mp4');

export default function WelcomeScreen() {
    const router = useRouter();
    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.muted = true;
        player.play();
    });

    return (
        <View className="flex-1 bg-black">
            <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
                style={StyleSheet.absoluteFill}
                locations={[0.0, 0.6, 1]}
            />

            <View className="flex-1 justify-end px-8 pb-16">
                <View className="mb-10">
                    <MaskedView
                        style={{ height: 80, marginBottom: 8 }}
                        maskElement={
                            <Text className="text-6xl font-black tracking-tighter" style={{ backgroundColor: 'transparent' }}>
                                EchoPod
                            </Text>
                        }
                    >
                        <LinearGradient
                            colors={['#ff6a00', '#ffb000']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ flex: 1 }}
                        />
                    </MaskedView>

                    <Text className="text-white text-4xl font-extrabold mb-4 tracking-tight leading-tight">
                        Immerse In Every Story.
                    </Text>
                    <Text className="text-gray-300 text-lg leading-relaxed font-medium">
                        Your ultimate destination for endless audio stories, deep insights, and hit podcasts. Tune in anywhere, anytime.
                    </Text>
                </View>

                <Pressable
                    onPress={() => router.push('/(auth)/sign-up')}
                    className="bg-[#ff6a00] w-full py-[18px] rounded-full items-center active:opacity-80"
                >
                    <Text className="text-white text-lg font-bold">
                        Get Started
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => router.push('/(auth)/sign-in')}
                    className="mt-6 items-center py-2"
                >
                    <Text className="text-neutral-300 font-medium text-base">
                        Already have an account? <Text className="text-white font-bold underline">Log In</Text>
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
