function padTime(time: number) {
  return String(time).padStart(2, "0");
}

export function formatAudioTimestamp(time: number) {
  const hours = (time / (60 * 60)) | 0;
  time -= hours * (60 * 60);
  const minutes = (time / 60) | 0;
  time -= minutes * 60;
  const seconds = time | 0;
  return `${hours ? padTime(hours) + ":" : ""}${padTime(minutes)}:${padTime(
    seconds,
  )}`;
}

const formatTimestampVTT = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.padStart(6, '0')}`;
};

// Function to convert JSON to VTT format
export const convertToVTT = (data: Array<{
  timestamp: [number, number | null];
  text: string;
}>) => {
  const subtitles = data.map((item, index) => {
    const startTime = formatTimestampVTT(item.timestamp[0]);
    const endTime = formatTimestampVTT(item.timestamp[1] ?? 0);
    return `${index + 1}\n${startTime} --> ${endTime}\n${item.text}\n`;
  }).join('\n');
  const initVTT = 'WEBVTT\n\n';
  return initVTT + subtitles;
};
