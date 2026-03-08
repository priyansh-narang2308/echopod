import { useAuth, useSignUp, useOAuth } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
    Pressable,
    TextInput,
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native'
import { GoogleIcon } from '@/components/google-icon'
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser'
import { LinearGradient } from 'expo-linear-gradient'

export default function SignUpPage() {
    useWarmUpBrowser()
    const { signUp, errors, fetchStatus } = useSignUp()
    const { isSignedIn } = useAuth()
    const router = useRouter()
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [emailFocused, setEmailFocused] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

    const onSignUpPress = async () => {
        try {
            const { error } = await signUp.password({ emailAddress, password })
            if (error) { console.error(JSON.stringify(error, null, 2)); return }
            await signUp.verifications.sendEmailCode()
            setPendingVerification(true)
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    const onPressVerify = async () => {
        try {
            await signUp.verifications.verifyEmailCode({ code })
            if (signUp.status === 'complete') {
                await signUp.finalize({
                    navigate: ({ session, decorateUrl }) => {
                        router.replace('/(tabs)/home' as any)
                    },
                })
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    const onSelectAuth = useCallback(async () => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow()
            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId })
                router.replace('/(tabs)/home' as any)
            }
        } catch (err) {
            console.error('OAuth error', err)
        }
    }, [])

    if (isSignedIn) return null
    if (signUp.status === undefined) return null

    if (pendingVerification) {
        return (
            <View className="flex-1 bg-[#0E0E0F] justify-center items-center px-6">
                <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden" pointerEvents="none">
                    <View
                        className="absolute w-80 h-80 rounded-full opacity-[0.12]"
                        style={{ backgroundColor: '#FF6A00', top: -80, right: -60 }}
                    />
                </View>

                <View className="w-full bg-[#18181B] rounded-3xl p-7 border border-[#27272A]">
                    <View className="self-center mb-6 w-16 h-16 rounded-2xl bg-[#FF6A00]/10 border border-[#FF6A00]/20 justify-center items-center">
                        <Text className="text-3xl">✉️</Text>
                    </View>

                    <Text className="text-white text-2xl font-bold text-center mb-2">Verify your email</Text>
                    <Text className="text-[#71717A] text-sm text-center mb-1">
                        We sent a 6-digit code to
                    </Text>
                    <Text className="text-[#FF6A00] text-sm font-semibold text-center mb-8">{emailAddress}</Text>

                    <Text className="text-[#A1A1AA] text-[11px] font-bold uppercase tracking-[1.5px] mb-3 ml-1">
                        Verification Code
                    </Text>
                    <TextInput
                        className="bg-[#27272A] rounded-xl px-5 py-4 text-white text-xl tracking-[12px] text-center mb-6 border border-[#3F3F46]"
                        value={code}
                        placeholder="000000"
                        placeholderTextColor="#52525B"
                        onChangeText={setCode}
                        keyboardType="numeric"
                        maxLength={6}
                    />

                    <Pressable onPress={onPressVerify} className="overflow-hidden rounded-2xl">
                        <LinearGradient
                            colors={['#FF6A00', '#FF4500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="py-4 items-center"
                        >
                            <Text className="text-white text-base font-bold tracking-wide">Finish Sign Up →</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#0E0E0F]"
        >
            <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
                <View
                    className="absolute w-96 h-96 rounded-full opacity-[0.12]"
                    style={{ backgroundColor: '#FF6A00', top: -120, right: -80 }}
                />
                <View
                    className="absolute w-64 h-64 rounded-full opacity-[0.07]"
                    style={{ backgroundColor: '#FF8800', bottom: 80, left: -60 }}
                />
            </View>

            <ScrollView
                contentContainerClassName="px-6 pt-16 pb-12 items-center"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="items-center mb-10 mt-14 w-full">
                    <View className="mb-6 relative">
                        <View className="w-20 h-20 rounded-[22px] bg-[#FF6A00]/10 border border-[#FF6A00]/25 justify-center items-center">
                            <Text className="text-4xl">🎙️</Text>
                        </View>
                    </View>

                    <Text className="text-white text-[32px] font-black tracking-tight mb-2">
                        Create account
                    </Text>
                    <Text className="text-[#bdbdc1] text-[15px] text-center leading-5">
                        Start listening with EchoPod today
                    </Text>
                </View>

                <View className="w-full bg-[#18181B] rounded-[28px] p-6 border border-[#27272A]">

                    <View className="mb-5">
                        <Text className="text-[#A1A1AA] text-[11px] font-bold uppercase tracking-[1.5px] mb-2.5 ml-1">
                            Email Address
                        </Text>
                        <View
                            className={`flex-row items-center bg-[#27272A] rounded-2xl border ${emailFocused ? 'border-[#FF6A00]' : 'border-[#3F3F46]'
                                }`}
                        >
                            <View className="pl-4 pr-2">
                            </View>
                            <TextInput
                                className="flex-1 py-4 pr-4 text-white text-[15px]"
                                autoCapitalize="none"
                                value={emailAddress}
                                placeholder="you@example.com"
                                placeholderTextColor="#52525B"
                                onChangeText={setEmailAddress}
                                keyboardType="email-address"
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                            />
                        </View>
                        {errors?.fields?.emailAddress && (
                            <Text className="text-[#F87171] text-xs mt-1.5 ml-1">
                                {errors.fields.emailAddress.message}
                            </Text>
                        )}
                    </View>

                    <View className="mb-7">
                        <Text className="text-[#A1A1AA] text-[11px] font-bold uppercase tracking-[1.5px] mb-2.5 ml-1">
                            Password
                        </Text>
                        <View
                            className={`flex-row items-center bg-[#27272A] rounded-2xl border ${passwordFocused ? 'border-[#FF6A00]' : 'border-[#3F3F46]'
                                }`}
                        >
                            <View className="pl-4 pr-2">
                            </View>
                            <TextInput
                                className="flex-1 py-4 text-white text-[15px]"
                                value={password}
                                placeholder="Create a strong password"
                                placeholderTextColor="#52525B"
                                secureTextEntry={!showPassword}
                                onChangeText={setPassword}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                            />
                            <Pressable
                                onPress={() => setShowPassword(!showPassword)}
                                className="px-4 py-4"
                                hitSlop={8}
                            >
                                <Text className="text-[16px]">{showPassword ? '👁️' : '🙈'}</Text>
                            </Pressable>
                        </View>
                        {errors?.fields?.password && (
                            <Text className="text-[#F87171] text-xs mt-1.5 ml-1">
                                {errors.fields.password.message}
                            </Text>
                        )}
                    </View>

                    <Pressable
                        onPress={onSignUpPress}
                        disabled={!emailAddress || !password || fetchStatus === "fetching"}
                        className={`py-4 rounded-xl items-center justify-center mb-6 flex-row gap-2 ${!emailAddress || !password
                            ? "bg-orange-500"
                            : "bg-orange-600 active:bg-orange-700"
                            }`}
                    >
                        <Text className="text-white text-base font-semibold">
                            {fetchStatus === "fetching" ? "Creating account..." : "Create Account"}
                        </Text>
                        <Text className="text-white text-base">→</Text>
                    </Pressable>

                    <View className="flex-row items-center mb-6">
                        <View className="flex-1 h-px bg-[#27272A]" />
                        <Text className="mx-4 text-[#3F3F46] text-xs font-medium uppercase tracking-widest">
                            or
                        </Text>
                        <View className="flex-1 h-px bg-[#27272A]" />
                    </View>

                    <Pressable
                        onPress={onSelectAuth}
                        className="flex-row items-center justify-center bg-[#27272A] border border-[#3F3F46] rounded-2xl py-4 mb-8 gap-3"
                    >
                        <GoogleIcon size={20} />
                        <Text className="text-[#E4E4E7] text-[15px] font-semibold">Continue with Google</Text>
                    </Pressable>

                    <View className="flex-row justify-center items-center">
                        <Text className="text-[#52525B] text-[14px]">Already have an account? </Text>
                        <Link href="/(auth)/sign-in" asChild>
                            <Pressable>
                                <Text className="text-[#FF6A00] text-[14px] font-bold">Sign in</Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>

                <Text className="text-[#3F3F46] text-xs text-center mt-8 leading-5">
                    By creating an account, you agree to our{' '}
                    <Text className="text-[#52525B] underline">Terms of Service</Text>
                    {' '}and{' '}
                    <Text className="text-[#52525B] underline">Privacy Policy</Text>
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}