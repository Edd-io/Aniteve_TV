import { JSX } from "react";
import Video, { SelectedVideoTrackType, VideoRef } from "react-native-video";
import { getAspectRatio, getResolutionFromHeight } from "../../utils/video";
import { StyleSheet } from "react-native";

export const VideoPlayer = ({
    urlVideo,
    typeSource,
    isPaused,
    setError,
    videoRef,
    setVideoReady,
    setDuration,
    setOnLoading,
    setProgress,
    currentProgressRef,
    isManualSeekingRef,
    setAspectRatio,
    setResolution,
    initPercent,
    timeToResume,
    setInitPercent,
    setTimeToResume,
    error,
    setEnded,
    videoReady
}: {
    urlVideo: string | null | undefined;
    typeSource: string;
    isPaused: boolean;
    setError: (value: string | null) => void;
    videoRef: React.RefObject<VideoRef | null>;
    setVideoReady: (value: boolean) => void;
    setDuration: (value: number) => void;
    setOnLoading: (value: boolean) => void;
    setProgress: (value: number) => void;
    currentProgressRef: React.MutableRefObject<number>;
    isManualSeekingRef: React.MutableRefObject<boolean>;
    setAspectRatio: (value: string | null) => void;
    setResolution: (value: string | null) => void;
    initPercent: number;
    timeToResume: number;
    setInitPercent: (value: number) => void;
    setTimeToResume: (value: number) => void;
    error: string | null;
    setEnded: (value: boolean) => void;
    videoReady: boolean;
    }): JSX.Element => {
    if (!(urlVideo && !error)) {
        return (<></>)
    }
    return (
        <Video
            style={[
                styles.video,
                { opacity: isPaused ? 0.5 : 1 },
                !videoReady && { opacity: 0 }
            ]}
            source={{ uri: urlVideo, type: typeSource }}
            resizeMode="contain"
            selectedVideoTrack={{
                type: SelectedVideoTrackType.RESOLUTION,
                value: 1080,
            }}
            ref={videoRef}
            controls={false}
            paused={isPaused}
            onError={(e) => {
                setError("Erreur de lecture vidéo.");
            }}
            onLoad={(data) => {
                setVideoReady(true);
                setDuration(data.duration);
                setOnLoading(false);

                if (initPercent > 0) {
                    const seekTime = (initPercent * data.duration) / 100;
                    currentProgressRef.current = seekTime;
                    setProgress(seekTime);
                    videoRef.current?.seek(seekTime);
                    setInitPercent(0);
                } else {
                    const seekTime = timeToResume > 0 ? timeToResume : 0;
                    currentProgressRef.current = seekTime;
                    setProgress(seekTime);
                    videoRef.current?.seek(seekTime);
                }
                setTimeToResume(0);

                if (data.naturalSize && data.naturalSize.width && data.naturalSize.height) {
                    const { width, height } = data.naturalSize;
                    setAspectRatio(getAspectRatio(width, height));
                    setResolution(getResolutionFromHeight(height));
                }
            }}
            onProgress={(data) => {
                if (!isManualSeekingRef.current) {
                    currentProgressRef.current = data.currentTime;
                    setProgress(data.currentTime);
                }
            }}
            onBuffer={(stateData) => {
                if (error)
                    return;
                setOnLoading(stateData.isBuffering);
            }}
            onEnd={() => {
                console.log('Video ended');
                setEnded(true);
            }}
        />
    )
}

const styles = StyleSheet.create({
	video: {
		flex: 1,
	},
});