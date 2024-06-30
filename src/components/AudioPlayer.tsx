import { useEffect, useRef } from "react";
import { convertToVTT } from "../utils/AudioUtils"
import { TranscriberData } from "../hooks/useTranscriber"

export default function AudioPlayer(props: {
  audioUrl: string;
  mimeType: string;
  transcribedData: TranscriberData
}) {
  const audioPlayer = useRef<HTMLAudioElement>(null);
  const audioSource = useRef<HTMLSourceElement>(null);
  const videoPlayer = useRef<HTMLVideoElement>(null);
  const videoSource = useRef<HTMLSourceElement>(null);
  const subtitleSource = useRef<HTMLTrackElement>(null);

  // Updates src when url changes
  useEffect(() => {
    if (audioPlayer.current && audioSource.current) {
      audioSource.current.src = props.audioUrl;
      audioPlayer.current.load();
    }
    if (videoPlayer.current && videoSource.current) {
      videoSource.current.src = props.audioUrl;
      videoPlayer.current.load();
    }
  }, [props.audioUrl]);

  useEffect(() => {
    if (props.transcribedData && !props.transcribedData.isBusy) {
      if (subtitleSource.current) {
        const vttText = convertToVTT(props.transcribedData.chunks)
        const vttBlob = new Blob([vttText], { type: "text/vtt" });
        const vttUrl = URL.createObjectURL(vttBlob);
        subtitleSource.current.src = vttUrl;
      }
    }
  }, [props.transcribedData])

  return (
    <div className='flex relative z-10 p-4 w-full'>
      {props.mimeType.includes("video") ? (
        <video
          ref={videoPlayer}
          controls
          className='w-full rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10'
        >
          <source ref={videoSource} type={props.mimeType}></source>
          <track ref={subtitleSource} kind="subtitles" />
        </video>
      ) : (
        <audio
          ref={audioPlayer}
          controls
          className='w-full h-14 rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10'
        >
          <source ref={audioSource} type={props.mimeType}></source>
        </audio>
      )}
    </div>
  );
}
