import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, Dimensions, Pressable, ActivityIndicator, ViewToken } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchRandomEpisodes } from '@/services/podcast-index';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '@/providers/player-provider';
import { useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Episode } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height: screenHeight } = Dimensions.get('window');

export default function MomentsScreen() {
    const { setEpisode, togglePlayback, player, episode: currentEpisode } = usePlayer();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const [containerHeight, setContainerHeight] = useState(screenHeight - 150); // initial guess

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['random-episodes'],
        queryFn: () => fetchRandomEpisodes(15),
    });

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 80,
    }).current;

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            const index = viewableItems[0].index ?? 0;
            setActiveIndex(index);
        }
    }).current;

    const episodes = data?.episodes || [];

    useEffect(() => {
        if (episodes.length > 0 && episodes[activeIndex]) {
            const ep = episodes[activeIndex];
            if (currentEpisode?.guid !== ep.guid) {
                 setEpisode(ep);
                 // We need to wait a tiny bit for the source to replace before playing
                 setTimeout(() => {
                     player.play();
                 }, 100);
            } else if (!player.playing) {
                // If it's already the current episode but not playing (e.g. came back to tab)
                player.play();
            }
        }
    }, [activeIndex, episodes.length]);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <ActivityIndicator size="large" color="#FF6A00" />
                <Text className="text-white mt-4 font-black tracking-widest text-lg">ECHOING...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black" onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
            <FlatList
                data={episodes}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                snapToInterval={containerHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                renderItem={({ item, index }) => (
                    <MomentItem 
                        episode={item} 
                        isActive={index === activeIndex} 
                        height={containerHeight}
                        insets={insets}
                        onPressFull={() => {
                            setEpisode(item);
                            router.push('/player');
                        }}
                    />
                )}
            />
            
            <View className="absolute top-14 left-6 right-6 flex-row justify-between items-center">
               
                <Pressable 
                    onPress={() => refetch()}
                    className="w-10 h-10 rounded-full bg-white/10 items-center justify-center backdrop-blur-md border border-white/20"
                >
                    <Ionicons name="refresh" size={20} color="white" />
                </Pressable>
            </View>
        </View>
    );
}

function MomentItem({ 
    episode, 
    isActive, 
    height: itemHeight, 
    insets,
    onPressFull 
}: { 
    episode: Episode, 
    isActive: boolean, 
    height: number, 
    insets: any,
    onPressFull: () => void 
}) {
    const { player, togglePlayback, episode: currentEpisode } = usePlayer();
    const status = useAudioPlayerStatus(player);
    const isPlaying = isActive && currentEpisode?.guid === episode.guid && status.playing;

    return (
        <View style={{ height: itemHeight, width }} className="bg-neutral-900">
            <Image 
                source={{ uri: episode.image || episode.feedImage }} 
                className="absolute inset-0 w-full h-full opacity-50"
                blurRadius={100}
            />
            
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
                className="absolute inset-0"
            />

            <View className="flex-1 items-center justify-center px-10">
                <View className="relative">
                    <View className="shadow-2xl shadow-black rounded-[40px] overflow-hidden">
                        <Image 
                            source={{ uri: episode.image || episode.feedImage }} 
                            className="w-72 h-72"
                            resizeMode="cover"
                        />
                    </View>
                </View>

                <View className="mt-10 items-center">
                    <View className="bg-[#FF6A00] px-3 py-1 rounded-md mb-4">
                        <Text className="text-white text-[10px] font-black uppercase tracking-widest">Trending moment</Text>
                    </View>
                    <Text className="text-white text-3xl font-black text-center leading-[34px]" numberOfLines={3}>
                        {episode.title}
                    </Text>
                    <Text className="text-white/40 text-base font-bold mt-3 text-center" numberOfLines={1}>
                        {episode.feedTitle}
                    </Text>
                </View>
            </View>

            <View 
                style={{ bottom: insets.bottom + 12 }}
                className="absolute left-8 right-8 flex-row items-center justify-between"
            >
                <View className="flex-row items-center gap-2 bg-white/5 py-2 px-4 rounded-full border border-white/10">
                    <Ionicons name="flash" size={14} color="#FF6A00" />
                    <Text className="text-white/80 font-bold text-xs uppercase tracking-tighter">
                        Quick Discovery
                    </Text>
                </View>

                <Pressable 
                    onPress={onPressFull}
                    className="bg-white px-6 py-3.5 rounded-2xl flex-row items-center gap-2 shadow-2xl"
                >
                    <Text className="text-black font-black text-sm uppercase tracking-tighter">Listen Full</Text>
                    <Ionicons name="arrow-forward" size={16} color="black" />
                </Pressable>
            </View>
        </View>
    );
}

