import { Text, Image, Pressable, View } from "react-native";
import React from "react";
import { Feed } from "@/types";
import { Link } from "expo-router";

type PodcastComponentProps = {
  podcast: Feed;
  onPress?: () => void;
};

export default function PodcastComponent({
  podcast,
  onPress,
}: PodcastComponentProps) {
  return (
    <Link
      href={`/home/${podcast.id}`}
      asChild
      style={{ flex: 1 }}
      className="mb-5"
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          {
            flex: 1,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/10">
          <Image
            source={{ uri: podcast.image || podcast.artwork }}
            className="w-full aspect-square bg-gray-100"
            resizeMode="cover"
          />
          <View className="p-3">
            <Text
              numberOfLines={2}
              className="text-[14px] font-semibold text-gray-900 leading-tight"
            >
              {podcast.title}
            </Text>
            <Text numberOfLines={1} className="text-[12px] text-gray-500 mt-1">
              {podcast.author || podcast.ownerName || "Unknown Author"}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
