import { AudioManager } from "./components/AudioManager";
import Transcript from "./components/Transcript";
import { useTranscriber } from "./hooks/useTranscriber";

// @ts-ignore
const IS_WEBGPU_AVAILABLE = !!navigator.gpu;

function App() {
  const transcriber = useTranscriber();

  return (
    IS_WEBGPU_AVAILABLE
      ? (
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
      )
      : (<div className="fixed w-screen h-screen bg-black z-10 bg-opacity-[92%] text-white text-2xl font-semibold flex justify-center items-center text-center">WebGPU is not supported<br />by this browser :&#40;</div>)
  );
}

export default App;
