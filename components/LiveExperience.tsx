
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

// Helper functions for manual base64 encoding/decoding as required by SDK rules
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Manual decoding logic for raw PCM data streams
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveExperience: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [transcripts, setTranscripts] = useState<{role: string, text: string}[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const stopSession = () => {
    setIsActive(false);
    setStatus('Standby');
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are a real-time vision assistant. Describe what you see and help the user with whatever is in front of the camera.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Active');
            
            // Audio input stream
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              // Rely on sessionPromise to send data and avoid race conditions
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            // Video frames (simulated via image frames every 1 second)
            intervalRef.current = window.setInterval(() => {
              if (videoRef.current && canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                canvasRef.current.width = videoRef.current.videoWidth / 4;
                canvasRef.current.height = videoRef.current.videoHeight / 4;
                ctx?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                canvasRef.current.toBlob(async (blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = (reader.result as string).split(',')[1];
                      sessionPromise.then(s => s.sendRealtimeInput({
                        media: { data: base64, mimeType: 'image/jpeg' }
                      }));
                    };
                    reader.readAsDataURL(blob);
                  }
                }, 'image/jpeg', 0.5);
              }
            }, 1000);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle audio and text transcriptions
            if (msg.serverContent?.outputTranscription) {
              setTranscripts(prev => [...prev, {role: 'AI', text: msg.serverContent!.outputTranscription!.text}]);
            }
            if (msg.serverContent?.inputTranscription) {
               setTranscripts(prev => [...prev, {role: 'You', text: msg.serverContent!.inputTranscription!.text}]);
            }

            // Playback model's audio output bits
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(
                decode(audioData),
                outputCtx,
                24000,
                1
              );
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle model interruptions by stopping all current audio sources
            if (msg.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch (e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live session error:', e);
            setStatus('Error');
            stopSession();
          },
          onclose: () => {
            console.log('Live session closed');
            stopSession();
          },
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Failed to start Live session:', error);
      setStatus('Failed');
      setIsActive(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 glass shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}></div>
          <h2 className="font-display font-semibold text-lg">Live Vision Experience</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">{status}</span>
          <button 
            onClick={isActive ? stopSession : startSession}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
              isActive 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {isActive ? 'Disconnect' : 'Connect Live'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Visual Feed */}
        <div className="flex-1 bg-black relative flex items-center justify-center p-4">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover rounded-2xl max-h-[80vh] shadow-2xl border border-white/5" 
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Initialize Vision Engine</h3>
              <p className="text-slate-500 text-sm max-w-xs text-center">Enable your camera and microphone for real-time multimodal interaction with Gemini.</p>
            </div>
          )}
        </div>

        {/* Transcripts Sidebar */}
        <div className="w-full md:w-96 border-l border-white/5 glass flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Transcript</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
            {transcripts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                Awaiting interaction...
              </div>
            ) : (
              transcripts.map((t, i) => (
                <div key={i} className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${t.role === 'AI' ? 'text-blue-400' : 'text-purple-400'}`}>
                    {t.role}
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    {t.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
