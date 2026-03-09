import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchFeedById, fetchEpisodesByFeedId } from "@/services/podcast-index";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Episode } from "@/types";
import { usePlayer } from "@/providers/player-provider";

const { width } = Dimensions.get("window");

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function stripHtml(html: string): string {
  return html?.replace(/<[^>]+>/g, "").trim() ?? "";
}

const PodcastDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, error } = useQuery({
    queryKey: ["feed", id],
    queryFn: () => fetchFeedById(id),
  });

  const { setEpisode } = usePlayer()

  const {
    data: episodesData,
    isLoading: episodesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["episodes", id],
    queryFn: ({ pageParam }) => fetchEpisodesByFeedId(id, pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => {
      const items = lastPage.items ?? [];
      if (items.length < 10) return undefined;
      return items[items.length - 1].datePublished;
    },
  });

  const podcast = data?.feed;
  const episodes: Episode[] = (() => {
    const seen = new Set<string>();
    return (episodesData?.pages ?? []).flatMap((p) => p.items ?? []).filter((ep) => {
      const key = ep.guid || String(ep.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();
  const hasMore = hasNextPage ?? false;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6A00" />
        <Text style={styles.loadingText}>Loading podcast...</Text>
      </View>
    );
  }

  if (error || !podcast) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color="#ccc" />
        <Text style={styles.errorText}>Failed to load podcast</Text>
        <Pressable onPress={() => router.back()} style={styles.backPill}>
          <Text style={styles.backPillText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const categories = podcast.categories ? Object.values(podcast.categories) : [];

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    if (distanceFromBottom < 300 && hasMore && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8 }]}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </Pressable>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={300}
        onScroll={handleScroll}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: podcast.image || podcast.artwork }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.88)"]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>

        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <Image
              source={{ uri: podcast.image || podcast.artwork }}
              style={styles.thumb}
              resizeMode="cover"
            />
            <View style={styles.titleMeta}>
              <Text style={styles.title} numberOfLines={3}>
                {podcast.title}
              </Text>
              <Text style={styles.author} numberOfLines={1}>
                {podcast.author || podcast.ownerName || "Unknown"}
              </Text>
              <View style={styles.inlineStats}>
                <View style={styles.inlineStat}>
                  <Ionicons name="mic-outline" size={12} color="#FF6A00" />
                  <Text style={styles.inlineStatText}>{podcast.episodeCount ?? "—"} eps</Text>
                </View>
                <View style={styles.inlineStat}>
                  <Ionicons name="language-outline" size={12} color="#FF6A00" />
                  <Text style={styles.inlineStatText}>{podcast.language?.toUpperCase() || "—"}</Text>
                </View>
                <View style={styles.inlineStat}>
                  <Ionicons
                    name={podcast.explicit ? "warning-outline" : "shield-checkmark-outline"}
                    size={12}
                    color={podcast.explicit ? "#ef4444" : "#22c55e"}
                  />
                  <Text style={[styles.inlineStatText, { color: podcast.explicit ? "#ef4444" : "#22c55e" }]}>
                    {podcast.explicit ? "Explicit" : "Clean"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {categories.length > 0 && (
            <View style={styles.categoryRow}>
              {categories.slice(0, 4).map((cat) => (
                <View key={cat} style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{cat}</Text>
                </View>
              ))}
            </View>
          )}

          {podcast.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description} numberOfLines={5}>
                {stripHtml(podcast.description)}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Episodes</Text>
            {episodesLoading ? (
              <ActivityIndicator color="#FF6A00" style={{ marginTop: 16 }} />
            ) : episodes.length === 0 ? (
              <Text style={styles.emptyText}>No episodes found</Text>
            ) : (
              episodes.map((ep: Episode, idx: number) => (
                <View key={ep.guid || `${ep.id}-${idx}`}>
                  <View style={styles.episodeRow}>
                    <View style={styles.episodeMeta}>
                      <Text style={styles.episodeDate}>{ep.datePublishedPretty}</Text>
                      <Text style={styles.episodeTitle} numberOfLines={2}>
                        {ep.title}
                      </Text>
                      <Text style={styles.episodeDesc} numberOfLines={2}>
                        {stripHtml(ep.description)}
                      </Text>
                      {ep.duration ? (
                        <Pressable onPress={() => { setEpisode(ep); router.push(`/player`) }} style={styles.durationPill}>
                          <Ionicons name="play" size={9} color="#555" />
                          <Text style={styles.durationText}>{formatDuration(ep.duration)}</Text>
                        </Pressable>
                      ) : null}
                    </View>
                    {(ep.image || podcast.image) ? (
                      <Image
                        source={{ uri: ep.image || podcast.image }}
                        style={styles.episodeImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.episodeImage, styles.episodeImagePlaceholder]}>
                        <Ionicons name="mic" size={20} color="#ccc" />
                      </View>
                    )}
                  </View>
                  {idx < episodes.length - 1 && <View style={styles.episodeDivider} />}
                </View>
              ))
            )}

            {isFetchingNextPage && (
              <ActivityIndicator color="#FF6A00" size="small" style={{ marginTop: 20, marginBottom: 8 }} />
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default PodcastDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    gap: 12,
  },
  loadingText: {
    color: "#6C757D",
    fontSize: 15,
    fontWeight: "500",
  },
  errorText: {
    color: "#6C757D",
    fontSize: 15,
    fontWeight: "500",
  },
  backPill: {
    backgroundColor: "#FF6A00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  backPillText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: "100%",
    height: width * 0.72,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  // The white sheet that slides up over the hero
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 14,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  titleMeta: {
    flex: 1,
    paddingTop: 2,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1C1E",
    lineHeight: 24,
  },
  author: {
    fontSize: 13,
    color: "#6C757D",
    fontWeight: "500",
  },
  inlineStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  inlineStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  inlineStatText: {
    fontSize: 11,
    color: "#495057",
    fontWeight: "600",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  categoryPill: {
    backgroundColor: "#FFF3EB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#FFD6B8",
  },
  categoryText: {
    color: "#FF6A00",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1C1E",
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 14,
    color: "#ADB5BD",
    textAlign: "center",
    marginTop: 16,
  },
  // Episode row
  episodeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 14,
  },
  episodeMeta: {
    flex: 1,
    gap: 4,
  },
  episodeDate: {
    fontSize: 12,
    color: "#ADB5BD",
    fontWeight: "500",
    marginBottom: 2,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1C1E",
    lineHeight: 22,
  },
  episodeDesc: {
    fontSize: 13,
    color: "#6C757D",
    lineHeight: 18,
    marginTop: 2,
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F3F5",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  durationText: {
    fontSize: 12,
    color: "#495057",
    fontWeight: "600",
  },
  episodeImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: "#F1F3F5",
  },
  episodeImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  episodeDivider: {
    height: 1,
    backgroundColor: "#F1F3F5",
  },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FFD6B8",
    backgroundColor: "#FFF8F4",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6A00",
  },
});
