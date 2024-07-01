import { AudioManager } from "./components/AudioManager";
import Transcript from "./components/Transcript";
import { useTranscriber } from "./hooks/useTranscriber";

function App() {
  const transcriber = useTranscriber();

  return (
    <div className='flex flex-row justify-center items-center min-h-screen flex-wrap'>
      <div className='container flex flex-col justify-center items-center min-w-[800px]'>
        <AudioManager transcriber={transcriber} />
      </div>
      <Transcript transcriber={transcriber} transcribedData={transcriber.output} />

      <div className='absolute bottom-4 left-2'>
        Made with{" "}
        <a
          className='underline'
          href='https://github.com/xenova/transformers.js'
        >
          🤗 Transformers.js
        </a>
      </div>
    </div>
  );
}

export default App;
