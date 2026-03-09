import { View, Text } from 'react-native'
import React from 'react'
import { usePlayer } from '@/providers/player-provider'
import { Redirect } from 'expo-router'

const EpisodePlayer = () => {

  const { episode } = usePlayer()
  if (!episode) return <Redirect href="/home" />

  return (
    <View>
      <Text>{episode?.title}</Text>
    </View>
  )
}

export default EpisodePlayer