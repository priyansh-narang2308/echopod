import { fetchTrending } from '@/services/podcast-index';
import { Button, Text, View } from 'react-native';

export default function Home() {

    const onPress = async () => {
        const data = await fetchTrending()
        console.log(JSON.stringify(data, null, 2))
    }

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-xl font-bold">Home</Text>

            <Button title='Fetch' onPress={onPress} />
        </View>
    );
}
