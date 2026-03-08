import React from 'react'
import { View, Text, Pressable, Image, Alert } from 'react-native'
import { useUser, useAuth } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function ProfileScreen() {
    const { user } = useUser()
    const { signOut } = useAuth()
    const router = useRouter()

    const onSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut()
                            router.replace('/(auth)/welcome')
                        } catch (err) {
                            console.error('Logout error', err)
                        }
                    },
                },
            ]
        )
    }

    const initial =
        user?.firstName?.charAt(0) ||
        user?.emailAddresses[0]?.emailAddress.charAt(0) ||
        '?'

    return (
        <View className="flex-1 bg-[#0E0E0F]">

            <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden" pointerEvents="none">
                <View
                    className="absolute w-96 h-96 rounded-full opacity-[0.13]"
                    style={{ backgroundColor: '#FF6A00', top: -140, right: -100 }}
                />
                <View
                    className="absolute w-56 h-56 rounded-full opacity-[0.06]"
                    style={{ backgroundColor: '#FF8800', bottom: 120, left: -60 }}
                />
            </View>

            <Pressable
                onPress={() => router.back()}
                className="absolute top-14 right-5 z-10 w-9 h-9 rounded-full bg-[#27272A] border border-[#3F3F46] items-center justify-center"
            >
                <Ionicons name="close" size={18} color="#A1A1AA" />
            </Pressable>

            <View className="flex-1 px-6 pt-20">

                <View className="items-center pt-8 pb-10">
                    <View className="relative mb-6">
                        {user?.imageUrl ? (
                            <Image
                                source={{ uri: user.imageUrl }}
                                className="w-28 h-28 rounded-full"
                            />
                        ) : (
                            <LinearGradient
                                colors={['#FF6A00', '#FF4500']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-28 h-28 rounded-full items-center justify-center"
                            >
                                <Text className="text-white text-5xl font-black">
                                    {initial.toUpperCase()}
                                </Text>
                            </LinearGradient>
                        )}
                    </View>

                    <Text className="text-white text-3xl font-black tracking-tight mb-1">
                        {user?.fullName || 'User'}
                    </Text>
                </View>

                <Text className="text-[#A1A1AA] text-[11px] font-bold uppercase tracking-[1.5px] mb-3 ml-1">
                    Email Address
                </Text>
                <View className="flex-row items-center bg-[#18181B] border border-[#27272A] rounded-2xl px-5 py-5 gap-4">
                    <View className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 border border-[#FF6A00]/20 items-center justify-center">
                        <Ionicons name="mail-outline" size={20} color="#FF6A00" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#52525B] text-[11px] font-semibold uppercase tracking-wider mb-0.5">Email</Text>
                        <Text className="text-white text-[15px] font-semibold" numberOfLines={1}>
                            {user?.emailAddresses[0]?.emailAddress || 'No email provided'}
                        </Text>
                    </View>
                    <View className="w-2 h-2 rounded-full bg-[#22C55E]" />
                </View>

            </View>

            <View className="px-6 pb-12">
                <Pressable
                    onPress={onSignOut}
                    className="flex-row items-center justify-center bg-[#18181B] border border-[#7F1D1D]/50 rounded-2xl py-[18px] gap-3 active:bg-[#27272A]"
                >
                    <Ionicons name="log-out-outline" size={20} color="#F87171" />
                    <Text className="text-[#F87171] text-[15px] font-bold">Sign Out</Text>
                </Pressable>
            </View>

        </View>
    )
}