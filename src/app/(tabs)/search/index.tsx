import { Stack } from 'expo-router'
import { useState } from 'react'
import { View, Text, FlatList, ActivityIndicator, Platform, TextInput, TouchableOpacity } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import PodcastComponent from '@/components/podcast-component'
import { searchPodcasts } from '@/services/podcast-index'
import { Ionicons } from '@expo/vector-icons'

export default function SearchScreen() {
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 400)

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ['search', debouncedSearchTerm],
        queryFn: () => searchPodcasts(debouncedSearchTerm),
        enabled: debouncedSearchTerm.length > 0,
    })

    const isSearching = debouncedSearchTerm.length > 0 && (isLoading || isFetching || searchTerm !== debouncedSearchTerm);
    const noResults = !isSearching && data?.feeds && data.feeds.length === 0 && debouncedSearchTerm.length > 0;

    return (
        <View className="flex-1 bg-[#F8F9FA]">
            <Stack.Screen
                options={{
                    headerSearchBarOptions: Platform.OS === 'ios' ? {
                        placeholder: "Search podcasts",
                        onChangeText: (event) => setSearchTerm(event.nativeEvent.text),
                        onClose: () => setSearchTerm(''),
                        hideWhenScrolling: false,
                    } : undefined
                }}
            />

            {Platform.OS === 'android' && (
                <View className="px-4 py-3 bg-[#F8F9FA]">
                    <View className="flex-row items-center bg-white rounded-2xl px-4 py-2 h-14" style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 }}>
                        <Ionicons name="search" size={22} color="#A0A0A0" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-gray-800"
                            placeholder="Search podcasts..."
                            placeholderTextColor="#A0A0A0"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm('')} className="p-1">
                                <Ionicons name="close-circle" size={22} color="#A0A0A0" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {!searchTerm ? (
                <View className="flex-1 items-center justify-center -mt-20">
                    <Ionicons name="search-circle" size={80} color="#E0E0E0" />
                    <Text className="text-[#A0A0A0] text-base mt-2 font-medium">Find your next favorite podcast</Text>
                </View>
            ) : isSearching ? (
                <View className="flex-1 items-center justify-center -mt-20 gap-4">
                    <ActivityIndicator size="large" />
                    <Text className="text-[#A0A0A0] text-sm font-medium">Searching for "{searchTerm}"...</Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center -mt-20 gap-2">
                    <Ionicons name="warning" size={48} color="#FF6A00" />
                    <Text className="text-gray-500 font-medium">Something went wrong</Text>
                </View>
            ) : noResults ? (
                <View className="flex-1 items-center justify-center -mt-20 gap-4">
                    <Ionicons name="folder-open-outline" size={60} color="#E0E0E0" />
                    <Text className="text-[#A0A0A0] text-base font-medium">No podcasts found for "{searchTerm}"</Text>
                </View>
            ) : (
                <FlatList
                    data={data?.feeds}
                    contentContainerClassName="p-4 pt-4"
                    columnWrapperClassName="gap-4 mb-4"
                    keyboardDismissMode="on-drag"
                    renderItem={({ item }) => (
                        <View className="flex-1 max-w-[48%]">
                            <PodcastComponent podcast={item} />
                        </View>
                    )}
                    numColumns={2}
                    keyExtractor={(item) => item.id.toString()}
                    contentInsetAdjustmentBehavior="automatic"
                />
            )}
        </View>
    )
}