import { fetchTrending } from '@/services/podcast-index';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Button, FlatList, Text, View } from 'react-native';

export default function Home() {

    const { isLoading, data, error } = useQuery({
        queryKey: ["trending"],
        queryFn: async () => await fetchTrending()
    })

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="mt-4 text-slate-500 font-medium animate-pulse">Discovering the best for you
                </Text>
            </View>
        )
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <Text className="mt-4 text-slate-500 font-medium animate-pulse">Failed to load trending podcasts
                </Text>
            </View>
        )
    }


    return (
        <FlatList
            data={data?.feeds}
            renderItem={({ item }) => (
                <Text>{item.title}</Text>
            )}
            contentInsetAdjustmentBehavior="automatic"
        />
    );
}
