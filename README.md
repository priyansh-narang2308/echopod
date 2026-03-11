# Echopod

**Echopod** is a next-generation podcast discovery and playback platform built with React Native and Expo. It reimagines the podcast experience by blending long-form audio with modern, social-media inspired discovery.

## Features

### Moments (Discovery Feed)
Experience podcasts like never before with a TikTok-style discovery feed. Scroll through random trending highlights, auto-play snippets, and instantly "jump" into full episodes when a topic catches your ear.

### True Offline Mode
Never lose your rhythm. Echopod allows you to download any episode directly to your device.
- **Persistent Storage**: Uses expo-file-system for reliable local storage.
- **Dedicated Library**: Access all your downloads in a clean, categorized folder view.
- **No Data Needed**: Perfect for commutes, flights, or remote escapes.

### Pro-Grade Player
A polished playback experience featuring:
- **Dynamic Speed**: Tailor your listening with playback speeds from 0.75x to 2.0x.
- **Visual Excellence**: Ambient blurred backgrounds that adapt to episode artwork.
- **Precise Controls**: Custom seek functionality, volume adjustment, and skip intervals.
- **Mini-Player**: Seamlessly browse the app while your audio continues in the background.

### Powerful Search & Trending
Integrates directly with the Podcast Index API to provide:
- Up-to-the-minute trending podcasts.
- Blazing fast search results.
- Comprehensive episode metadata and high-quality artwork.

---

## Tech Stack

- **Core**: [React Native](https://reactnative.dev/) + [Expo (SDK 55)](https://expo.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (Native Tabs)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) + [TanStack Query v5](https://tanstack.com/query/latest)
- **Audio**: [Expo Audio](https://docs.expo.dev/versions/latest/sdk/audio/)
- **Storage**: [Expo SQLite (KV-Store)](https://docs.expo.dev/versions/latest/sdk/sqlite/) & [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/secure-store/)
- **Auth**: [Clerk](https://clerk.com/docs/quickstarts/expo)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Watchman (for macOS users)
- Expo Go app on your mobile device or an Emulator (iOS/Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/echopod.git
   cd echopod
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Podcast Index API keys:
   ```env
   EXPO_PUBLIC_PODCAST_INDEX_API_KEY=your_api_key
   EXPO_PUBLIC_PODCAST_INDEX_SECRET_KEY=your_secret_key
   ```

4. **Start the development server**
   ```bash
   npx expo start -c
   ```

---

## Project Structure

```text
src/
├── app/
│   ├── (tabs)/
│   │   ├── home/
│   │   ├── search/
│   │   ├── moments/
│   │   └── library/
│   └── player.tsx
├── components/
├── providers/
├── store/
├── services/
└── types/
```

---

## Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License
Distributed under the MIT License. See LICENSE for more information.

Developed for Podcast Lovers.
