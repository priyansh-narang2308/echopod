import { Stack } from 'expo-router';

export default function LibraryLayout() {
    return (
        <Stack screenOptions={{ headerLargeTitle: true }}>
            <Stack.Screen name="index" options={{ title: 'Library' }} />
            <Stack.Screen name="downloads" options={{ title: 'Downloads', headerLargeTitle: false }} />
        </Stack>
    );
}
