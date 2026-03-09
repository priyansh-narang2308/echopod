import { Stack, useRouter } from 'expo-router';
import { Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';

export default function HomeLayout() {
    const router = useRouter();
    const { user } = useUser();

    return (
        <Stack screenOptions={{
            headerLargeTitle: true,
            headerTransparent: false
        }}>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push('/profile')}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.7 : 1,
                                marginRight: 4,
                            })}
                        >
                            {user?.imageUrl ? (
                                <Image
                                    source={{ uri: user.imageUrl }}
                                    style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: "white" }}
                                />
                            ) : (
                                <Ionicons name="person-circle-outline" size={32} color="#FF6A00" />
                            )}
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}
