
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

export const SpeechStudio: React.FC = () => {
  const [text, setText] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [voice, setVoice] = useState('Kore');
  const voices = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

  const handleSynthesize = async () => {
    if (!text.trim() || isSynthesizing) return;

    setIsSynthesizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        // Manual base64 decoding as required by SDK rules
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Manual audio decoding for raw PCM data (non-standard format)
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (error) {
      console.error('TTS Error:', error);
      alert('Speech synthesis failed.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 items-center justify-center p-6">
      <div className="w-full max-w-2xl glass p-8 rounded-3xl space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display">Neural Speech Synthesis</h2>
          <p className="text-slate-400 text-sm">Convert text to hyper-realistic human voices using Gemini TTS.</p>
        </div>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-48 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg"
            placeholder="Type or paste the text you'd like me to read..."
          />
          
          <div className="flex flex-wrap gap-3">
            {voices.map(v => (
              <button
                key={v}
                onClick={() => setVoice(v)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  voice === v ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSynthesize}
          disabled={!text.trim() || isSynthesizing}
          className="w-full py-5 rounded-2xl bg-white text-slate-950 font-bold hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSynthesizing ? 'Synthesizing Audio...' : 'Speak Now'}
        </button>
      </div>
    </div>
  );
};
