import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchFeedById } from "@/services/podcast-index";

const PodcastDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["feed", id],
    queryFn: () => fetchFeedById(id),
  });

  const podcast = data?.feed;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="mt-4 text-slate-500 font-medium animate-pulse">
          Discovering the best for you
        </Text>
      </View>
    );
  }

  if (error || !podcast) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Text className="mt-4 text-slate-500 font-medium animate-pulse">
          Failed to load podcast information
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text>{podcast .title}</Text>
    </View>
  );
};

export default PodcastDetails;
