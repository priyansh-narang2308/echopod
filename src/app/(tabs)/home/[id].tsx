import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchFeedById } from "@/services/podcast-index";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const PodcastDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, error } = useQuery({
    queryKey: ["feed", id],
    queryFn: () => fetchFeedById(id),
  });

  const podcast = data?.feed;

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

  const categories = podcast.categories
    ? Object.values(podcast.categories)
    : [];

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
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: podcast.image || podcast.artwork }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.85)"]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>

        <View style={styles.card}>
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
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="mic-outline" size={20} color="#FF6A00" />
              <Text style={styles.statNumber}>{podcast.episodeCount ?? "—"}</Text>
              <Text style={styles.statLabel}>Episodes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="language-outline" size={20} color="#FF6A00" />
              <Text style={styles.statNumber}>
                {podcast.language?.toUpperCase() || "—"}
              </Text>
              <Text style={styles.statLabel}>Language</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons
                name={podcast.explicit ? "warning-outline" : "shield-checkmark-outline"}
                size={20}
                color={podcast.explicit ? "#ef4444" : "#22c55e"}
              />
              <Text style={styles.statNumber}>
                {podcast.explicit ? "Explicit" : "Clean"}
              </Text>
              <Text style={styles.statLabel}>Content</Text>
            </View>
          </View>

          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoryRow}>
                {categories.map((cat) => (
                  <View key={cat} style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {podcast.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{podcast.description}</Text>
            </View>
          ) : null}

          {(podcast.ownerName || podcast.author) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Creator</Text>
              <View style={styles.ownerRow}>
                <View style={styles.ownerAvatar}>
                  <Text style={styles.ownerInitial}>
                    {(podcast.ownerName || podcast.author || "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.ownerName}>
                    {podcast.ownerName || podcast.author}
                  </Text>
                  {podcast.ownerName && podcast.author && podcast.ownerName !== podcast.author && (
                    <Text style={styles.ownerSub}>{podcast.author}</Text>
                  )}
                </View>
              </View>
            </View>
          )}
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
  heroContainer: {
    width: "100%",
    height: width * 0.72,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    minHeight: 600,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 14,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  titleMeta: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1C1E",
    lineHeight: 26,
    marginBottom: 6,
  },
  author: {
    fontSize: 14,
    color: "#6C757D",
    fontWeight: "500",
  },
  subscribeBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 24,
  },
  subscribeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  subscribeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1C1E",
  },
  statLabel: {
    fontSize: 11,
    color: "#ADB5BD",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E9ECEF",
    marginVertical: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1C1E",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 22,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryPill: {
    backgroundColor: "#FFF3EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FFD6B8",
  },
  categoryText: {
    color: "#FF6A00",
    fontSize: 13,
    fontWeight: "600",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
  },
  ownerInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  ownerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1C1E",
  },
  ownerSub: {
    fontSize: 13,
    color: "#6C757D",
    marginTop: 2,
  },
});
