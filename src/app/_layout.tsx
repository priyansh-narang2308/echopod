import React from 'react'
import { Stack } from 'expo-router'
import "../../global.css"

import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
}

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
            </Stack.Protected>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    )
}

const RootLayout = () => {
    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <RootStack />
        </ClerkProvider>
    )
}

export default RootLayout