import { Episode } from "@/types";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { AudioPlayer, createAudioPlayer } from "expo-audio"

type PlayerContext = {
    episode: Episode | null;
    setEpisode: (ep: Episode | null) => void;
    player: AudioPlayer;
    togglePlayback: () => void;
}

const PlayerContext = createContext<PlayerContext | null>(null)

const player = createAudioPlayer(null, { updateInterval: 500 })

export default function PlayerProvider({ children }: PropsWithChildren) {
    const [episode, setEpisode] = useState<Episode | null>(null)

    const setActiveEpisode = (episode: Episode | null) => {
        setEpisode(episode)
        // Load the track but don't auto-play — user hits play on the player screen
        player.replace({ uri: episode?.enclosureUrl })
    }

    const togglePlayback = () => {
        if (player.playing) {
            player.pause()
        } else {
            player.play()
        }
    }

    return (
        <PlayerContext.Provider value={{ episode, setEpisode: setActiveEpisode, player, togglePlayback }}>
            {children}
        </PlayerContext.Provider>
    )
}

export const usePlayer = () => {
    const context = useContext(PlayerContext)
    if (!context) {
        throw new Error("usePlayer must be used within a PlayerProvider")
    }
    return context
}