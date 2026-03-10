import { Episode } from "@/types";
import { createContext, PropsWithChildren, useCallback, useContext, useRef, useState } from "react";
import { AudioPlayer, createAudioPlayer } from "expo-audio"

type PlayerContext = {
    episode: Episode | null;
    episodes: Episode[];
    setEpisode: (ep: Episode | null) => void;
    setQueue: (eps: Episode[]) => void;
    player: AudioPlayer;
    togglePlayback: () => void;
    playNext: () => void;
    playPrev: () => void;
    setSpeed: (rate: number) => void;
    speed: number;
}

const PlayerContext = createContext<PlayerContext | null>(null)

const player = createAudioPlayer(null, { updateInterval: 250 })

export default function PlayerProvider({ children }: PropsWithChildren) {
    const [episode, setEpisodeState] = useState<Episode | null>(null)
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [speed, setSpeedState] = useState(1)
    const episodesRef = useRef<Episode[]>([])
    const episodeRef = useRef<Episode | null>(null)

    const loadEpisode = useCallback((ep: Episode | null) => {
        episodeRef.current = ep
        setEpisodeState(ep)
        if (ep) {
            player.replace({ uri: ep.enclosureUrl })
        }
    }, [])

    const setQueue = useCallback((eps: Episode[]) => {
        episodesRef.current = eps
        setEpisodes(eps)
    }, [])

    const setEpisode = useCallback((ep: Episode | null) => {
        loadEpisode(ep)
    }, [loadEpisode])

    const togglePlayback = useCallback(() => {
        if (player.playing) {
            player.pause()
        } else {
            player.play()
        }
    }, [])

    const playNext = useCallback(() => {
        const list = episodesRef.current
        const current = episodeRef.current
        if (!list.length || !current) return
        const idx = list.findIndex(e => e.id === current.id)
        const next = list[idx + 1]
        if (next) {
            loadEpisode(next)
            player.play()
        }
    }, [loadEpisode])

    const playPrev = useCallback(() => {
        const list = episodesRef.current
        const current = episodeRef.current
        if (!list.length || !current) return
        const idx = list.findIndex(e => e.id === current.id)
        const prev = list[idx - 1]
        if (prev) {
            loadEpisode(prev)
            player.play()
        }
    }, [loadEpisode])

    const setSpeed = useCallback((rate: number) => {
        setSpeedState(rate)
        player.setPlaybackRate(rate, 'medium')
    }, [])

    return (
        <PlayerContext.Provider value={{
            episode,
            episodes,
            setEpisode,
            setQueue,
            player,
            togglePlayback,
            playNext,
            playPrev,
            setSpeed,
            speed,
        }}>
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