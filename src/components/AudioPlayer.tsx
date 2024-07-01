import { useEffect, useRef } from "react";
import { convertToVTT } from "../utils/AudioUtils"
import { TranscriberData } from "../hooks/useTranscriber"

export default function AudioPlayer(props: {
  audioUrl: string;
  mimeType: string;
  transcribedData?: TranscriberData
}) {
  const audioPlayer = useRef<HTMLAudioElement>(null);
  const audioSource = useRef<HTMLSourceElement>(null);
  const videoPlayer = useRef<HTMLVideoElement>(null);
  const videoSource = useRef<HTMLSourceElement>(null);
  const subtitleSource = useRef<HTMLTrackElement>(null);
  const linkTarget = useRef<HTMLButtonElement>(null);

  const playtime_event = (event: Event) => {
    if (!props.transcribedData) return;
    const chunks = props.transcribedData.chunks
    const element = event.target as HTMLMediaElement
    const currentTime = element.currentTime
    let targetIdx = -1;
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i]
      if (c.timestamp[0] <= currentTime && (c.timestamp[1] ?? 0) >= currentTime) {
        targetIdx = i
        break
      }
    }
    if (targetIdx === -1) return;
    const query = `[data-testid="chunk-${targetIdx}"]`;
    const target = document.querySelector(query)
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
      target.classList.add("bg-yellow-300/50")
    }
  }
  const clear_event = () => {
    const clearElements = document.querySelectorAll("[data-testid]")
    clearElements.forEach(e => {
      e.classList.remove("bg-yellow-300/50")
    });
  }


  // Updates src when url changes
  useEffect(() => {
    if (audioPlayer.current && audioSource.current) {
      audioSource.current.src = props.audioUrl;
      audioPlayer.current.load();
      audioPlayer.current.ontimeupdate = playtime_event;
      audioPlayer.current.onpause = clear_event;
      audioPlayer.current.onplay = clear_event;
    }
    if (videoPlayer.current && videoSource.current) {
      videoSource.current.src = props.audioUrl;
      videoPlayer.current.load();
      videoPlayer.current.ontimeupdate = playtime_event;
      videoPlayer.current.onpause = clear_event;
      videoPlayer.current.onplay = clear_event;
    }
  }, [props.audioUrl]);

  useEffect(() => {
    if (props.transcribedData && !props.transcribedData.isBusy) {
      const vttText = convertToVTT(props.transcribedData.chunks)
      const vttBlob = new Blob([vttText], { type: "text/vtt" });
      const vttUrl = URL.createObjectURL(vttBlob);
      if (subtitleSource.current) {
        subtitleSource.current.src = vttUrl;
      }
      if (linkTarget.current) {
        linkTarget.current.onclick = () => {
          const link = document.createElement("a");
          link.href = vttUrl;
          link.download = "subtitle.vtt";
          link.click();
        }
      }
    }
    if (audioPlayer.current) {
      audioPlayer.current.ontimeupdate = playtime_event;
      audioPlayer.current.onpause = clear_event;
      audioPlayer.current.onplay = clear_event;
    }
    if (videoPlayer.current) {
      videoPlayer.current.ontimeupdate = playtime_event;
      videoPlayer.current.onpause = clear_event;
      videoPlayer.current.onplay = clear_event;
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
          <track ref={subtitleSource} kind="subtitles" default srcLang="zh" />
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
      {
        props.transcribedData?.isBusy !== true && (
          <button ref={linkTarget} className="bg-slate-500/50 text-white p-2 rounded-xl absolute right-4 top-4">字幕下載</button>
        )
      }
    </div>
  );
}
