import { View, Text, FlatList, Pressable, Image, Alert } from 'react-native';
import { useDownloadsStore } from '@/store/useDownloadsStore';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '@/providers/player-provider';
import * as FileSystem from 'expo-file-system';
import { Episode } from '@/types';

export default function Downloads() {
    const { episodes, removeDownload } = useDownloadsStore();
    const { setEpisode, player, episode: currentEpisode } = usePlayer();

    const downloadedList = Object.values(episodes).sort((a, b) => b.downloadedAt - a.downloadedAt);

    const handlePlay = (item: typeof downloadedList[0]) => {
        const mockEpisode: Partial<Episode> = {
            id: Number(item.guid) || 0,
            guid: item.guid,
            title: item.title,
            image: item.image || '',
            feedTitle: item.feedTitle,
            enclosureUrl: item.localUri,
            feedImage: item.image || '',
            datePublishedPretty: new Date(item.downloadedAt).toLocaleDateString(),
        };

        setEpisode(mockEpisode as Episode);
        player.play();
    };

    const confirmDelete = (guid: string, localUri: string, title: string) => {
        Alert.alert(
            "Delete Episode",
            `Are you sure you want to delete "${title}" from your device?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await FileSystem.deleteAsync(localUri, { idempotent: true });
                        } catch (err) {
                            console.error("Failed to delete local file:", err);
                        }
                        removeDownload(guid);
                    }
                }
            ]
        );
    };

    if (downloadedList.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-[#F8F9FA] -mt-20 gap-4">
                <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-2">
                    <Ionicons name="cloud-offline" size={50} color="#999" />
                </View>
                <Text className="text-xl font-bold text-gray-800">No Downloads Yet</Text>
                <Text className="text-sm text-gray-500 text-center px-10">
                    Episodes you download for offline listening will appear here.
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F8F9FA]">
            <FlatList
                data={downloadedList}
                keyExtractor={(item) => item.guid}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerClassName="p-4 pt-4 gap-4"
                renderItem={({ item }) => {
                    const isPlaying = currentEpisode?.guid === item.guid && player.playing;

                    return (
                        <Pressable
                            className="flex-row items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
                            onPress={() => handlePlay(item)}
                        >
                            <Image
                                source={{ uri: item.image || 'https://via.placeholder.com/150' }}
                                className="w-16 h-16 rounded-xl bg-gray-200"
                            />

                            <View className="flex-1 px-3 gap-1">
                                <Text className="text-[15px] font-bold text-gray-900 leading-tight" numberOfLines={2}>
                                    {item.title}
                                </Text>
                                <Text className="text-[13px] font-medium text-gray-500" numberOfLines={1}>
                                    {item.feedTitle}
                                </Text>
                            </View>

                            <View className="flex-row items-center gap-2 pl-1">
                                <Pressable
                                    onPress={() => confirmDelete(item.guid, item.localUri, item.title)}
                                    className="w-10 h-10 items-center justify-center rounded-full bg-red-50"
                                >
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </Pressable>
                                
                            </View>
                        </Pressable>
                    );
                }}
            />
        </View>
    );
}
