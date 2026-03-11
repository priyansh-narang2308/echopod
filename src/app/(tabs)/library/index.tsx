import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Library() {
    const router = useRouter();

    return (
        <ScrollView 
            className="flex-1 bg-[#F8F9FA]" 
            contentContainerClassName="p-4"
            contentInsetAdjustmentBehavior="automatic"
        >
            <Pressable
                onPress={() => router.push('/library/downloads')}
                className="flex-row items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            >
                <View className="w-12 h-12 rounded-xl bg-[#FFF3EB] items-center justify-center">
                    <Ionicons name="download-outline" size={24} color="#FF6A00" />
                </View>
                
                <View className="flex-1 px-4">
                    <Text className="text-[17px] font-bold text-gray-900">Downloads</Text>
                    <Text className="text-[14px] text-gray-500">Listen to downloaded episodes offline</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </Pressable>
        </ScrollView>
    );
}
