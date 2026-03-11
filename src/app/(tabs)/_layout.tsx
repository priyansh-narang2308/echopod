import MiniPlayer from '@/components/mini-player';
import { usePlayer } from '@/providers/player-provider';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useSegments } from 'expo-router';

export default function TabLayout() {
    const { episode } = usePlayer();
    const segments = useSegments();
    
    // Check if the current tab is 'moments'
    // Segments for (tabs)/moments will be ['(tabs)', 'moments']
    const isMomentsTab = segments[1] === 'moments';

    return (
        <NativeTabs minimizeBehavior="onScrollDown">
            <NativeTabs.Trigger name="home">
                <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="moments">
                <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
                <NativeTabs.Trigger.Label>Moments</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="library">
                <NativeTabs.Trigger.Icon sf="books.vertical.fill" md="library_books" />
                <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="search" role='search'>
                <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
                <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            {episode && !isMomentsTab && (
                <NativeTabs.BottomAccessory>
                    <MiniPlayer />
                </NativeTabs.BottomAccessory>
            )}
        </NativeTabs>
    );
}