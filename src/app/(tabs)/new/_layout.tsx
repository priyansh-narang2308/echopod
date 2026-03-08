import { Stack } from 'expo-router';

export default function NewLayout() {
    return (
        <Stack screenOptions={{ headerLargeTitle: true }}>
            <Stack.Screen name="index" options={{ title: 'New' }} />
        </Stack>
    );
}
