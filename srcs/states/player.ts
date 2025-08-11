import { useRef, useState } from "react";
import { AnimeEpisodesData } from "../data/anime_api_service";
import { VideoRef } from "react-native-video";
import { ProgressDataAnime } from "../data/anime_api_service";

export function states({
  episodeIndex,
  seasonIndex,
  ProgressDataAnime
}: {
  episodeIndex: number;
  seasonIndex: number;
  ProgressDataAnime?: ProgressDataAnime | null;
}) {
	const [typeSource, setTypeSource] = useState<string>('');
	const [episodesState, setEpisodesState] = useState<AnimeEpisodesData | null>(null);
	const [episodeIndexState, setEpisodeIndexState] = useState<number>(episodeIndex);
	const [sourceIndex, setSourceIndex] = useState<number>(0);
	const [seasonIndexState, setSeasonIndexState] = useState<number>(seasonIndex);
	const [urlVideo, setUrlVideo] = useState<string | null>();

	const [error, setError] = useState<string | null>(null);

	const [showInterface, setShowInterface] = useState<boolean>(true);
	const [showSourceSelector, setShowSourceSelector] = useState<boolean>(false);
	const [duration, setDuration] = useState<number>(0);
	const [progress, setProgress] = useState<number>(0);
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [onLoading, setOnLoading] = useState<boolean>(false);
	const [initPercent, setInitPercent] = useState<number>(ProgressDataAnime?.find ? ProgressDataAnime!.progress! : 0);
	const [timeToResume, setTimeToResume] = useState<number>(0);
	const [videoReady, setVideoReady] = useState<boolean>(false);
	const videoRef = useRef<VideoRef>(null);
	const timeoutInterfaceRef = useRef<NodeJS.Timeout | null>(null);
	const currentProgressRef = useRef<number>(0);
	const isManualSeekingRef = useRef<boolean>(false);
	const [resolution, setResolution] = useState<string | null>(null);
	const [aspectRatio, setAspectRatio] = useState<string | null>(null);
	const [ended, setEnded] = useState<boolean>(false);
	const [indexMenu, setIndexMenu] = useState<number>(0);
	const [timeSkip, setTimeSkip] = useState<number>(15);

    return {
        typeSource,
        episodesState,
        episodeIndexState,
        sourceIndex,
        seasonIndexState,
        urlVideo,
        error,
        showInterface,
        showSourceSelector,
        duration,
        progress,
        isPaused,
        onLoading,
        initPercent,
        timeToResume,
        videoReady,
        videoRef,
        timeoutInterfaceRef,
        currentProgressRef,
        isManualSeekingRef,
        resolution,
        aspectRatio,
        ended,
        indexMenu,
        timeSkip,
        setTypeSource,
        setEpisodesState,
        setEpisodeIndexState,
        setSourceIndex,
        setSeasonIndexState,
        setUrlVideo,
        setError,
        setShowInterface,
        setShowSourceSelector,
        setDuration,
        setProgress,
        setIsPaused,
        setOnLoading,
        setInitPercent,
        setTimeToResume,
        setVideoReady,
        setResolution,
        setAspectRatio,
        setEnded,
        setIndexMenu,
        setTimeSkip
    };
}