import { useRef, useEffect, useState } from "react";
import { Transcriber, TranscriberData } from "../hooks/useTranscriber";
import { formatAudioTimestamp } from "../utils/AudioUtils";

interface Props {
  transcribedData: TranscriberData | undefined;
  transcriber: Transcriber
}

export default function Transcript({ transcribedData, transcriber }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  const exportTXT = () => {
    let chunks = transcribedData?.chunks ?? [];
    let text = chunks
      .map((chunk) => chunk.text)
      .join("")
      .trim();

    const blob = new Blob([text], { type: "text/plain" });
    saveBlob(blob, "transcript.txt");
  };
  const exportJSON = () => {
    let jsonData = JSON.stringify(transcribedData?.chunks ?? [], null, 2);

    // post-process the JSON to make it more readable
    const regex = /(    "timestamp": )\[\s+(\S+)\s+(\S+)\s+\]/gm;
    jsonData = jsonData.replace(regex, "$1[$2 $3]");

    const blob = new Blob([jsonData], { type: "application/json" });
    saveBlob(blob, "transcript.json");
  };

  // Scroll to the bottom when the component updates
  useEffect(() => {
    if (divRef.current) {
      const diff = Math.abs(
        divRef.current.offsetHeight +
        divRef.current.scrollTop -
        divRef.current.scrollHeight,
      );

      if (diff <= 100) {
        // We're close enough to the bottom, so scroll to the bottom
        divRef.current.scrollTop = divRef.current.scrollHeight;
      }
    }
  });

  const videoJumpTo = (time: number) => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = time - 0.1;
    }
    const audio = document.querySelector('audio');
    if (audio) {
      audio.currentTime = time - 0.1;
    }
  }

  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const saveEditingContent = () => {
    if (!transcribedData || !transcribedData.chunks || currentEditingIndex === null) {
      setCurrentEditingIndex(null);
      setEditingContent("");
      return;
    }
    const newData = structuredClone(transcribedData);
    newData.chunks[currentEditingIndex].text = editingContent;
    transcriber.setTranscript(newData);
    setCurrentEditingIndex(null);
    setEditingContent("");
  }

  return (
    <div
      ref={divRef}
      className='w-[30rem] flex flex-col my-2 p-4 max-h-[80vh] overflow-y-auto'
    >
      {transcribedData?.chunks &&
        transcribedData.chunks.map((chunk, i) => (
          <div
            data-testid={`chunk-${i}`}
            key={`${i}-${chunk.text}`}
            className={`w-full flex flex-row mb-2 ${transcribedData?.isBusy ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-200 rounded-lg p-4 shadow-xl shadow-black/5 ring-1 ring-slate-700/10`}
            onClick={() => videoJumpTo(chunk.timestamp[0])}
          >
            <div className='mr-5'>
              {formatAudioTimestamp(chunk.timestamp[0])} -
              {formatAudioTimestamp(chunk.timestamp[1])}
            </div>
            {currentEditingIndex === i ? (
              <>
                <input className='w-full bg-gray-100 rounded-lg p-2 mx-1' value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
                <button className="mx-1 bg-gray-100 text-gray-500 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center" onClick={saveEditingContent}>Save</button>
              </>
            ) : (
              <span
                onDoubleClick={() => {
                  setCurrentEditingIndex(i);
                  setEditingContent(chunk.text)
                }}
                className="text-gray-500">{chunk.text}</span>
            )}
          </div>
        ))
      }
      {
        transcribedData?.tps &&
        (
          <p className='text-sm text-center mt-4 mb-1'>
            <span className="font-semibold text-black">{transcribedData?.tps.toFixed(2)}</span> <span className="text-gray-500">tokens/second</span>
          </p>
        )
      }
      {
        transcribedData && !transcribedData.isBusy && (
          <div className='w-full text-right'>
            <button
              onClick={exportTXT}
              className='text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 inline-flex items-center'
            >
              Export TXT
            </button>
            <button
              onClick={exportJSON}
              className='text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 inline-flex items-center'
            >
              Export JSON
            </button>
          </div>
        )
      }
    </div >
  );
}
