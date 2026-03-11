import React from 'react'
import { Stack } from 'expo-router'
import "../../global.css"

import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { resourceCache } from '@clerk/expo/resource-cache'

import { useReactQueryDevTools } from '@dev-plugins/react-query';

import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import PlayerProvider from '@/providers/player-provider'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
}

const queryClient = new QueryClient()

function RootStack() {

    const { isLoaded, isSignedIn } = useAuth()
    if (!isLoaded) {
        return null
    }

    return (
        <Stack>
            <Stack.Protected guard={!isSignedIn}>
                <Stack.Screen name='(auth)' options={{ headerShown: false }} />
            </Stack.Protected>
            <Stack.Protected guard={isSignedIn} >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="player" options={{ presentation: "fullScreenModal", headerShown: false }} />
            </Stack.Protected>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    )
}

const RootLayout = () => {
    useReactQueryDevTools(queryClient);

    return (
        <QueryClientProvider client={queryClient}>
            <ClerkProvider
                __experimental_resourceCache={resourceCache}
                publishableKey={publishableKey}
                tokenCache={tokenCache}
            >
                <PlayerProvider>
                    <RootStack />
                </PlayerProvider>
            </ClerkProvider>
        </QueryClientProvider>
    )
}

export default RootLayout