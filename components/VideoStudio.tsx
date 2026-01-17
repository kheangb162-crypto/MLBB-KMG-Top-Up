
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

export const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const checkKey = async () => {
    // This is the mandatory billing/key check for Veo models
    if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      if (!selected) {
        // As per guidelines, assume successful selection after triggering openSelectKey
        await (window as any).aistudio.openSelectKey();
      }
      return true;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    await checkKey();
    setIsGenerating(true);
    setVideoUrl(null);
    setStatus('Initializing Veo pipeline...');

    try {
      // Create a new instance right before making an API call to ensure current key usage
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatus('Synthesizing motion frames (this may take a few minutes)...');
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        setStatus(prev => prev.includes('...') ? 'Synthesizing motion frames..' : 'Synthesizing motion frames...');
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      setStatus('Fetching final render...');
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) {
        if (response.status === 404) {
           // If the project wasn't found, reset key selection and prompt again
           await (window as any).aistudio.openSelectKey();
           throw new Error("Requested entity was not found. Please re-select your API key.");
        }
        throw new Error("Failed to fetch generated video.");
      }
      const blob = await response.blob();
      setVideoUrl(URL.createObjectURL(blob));
      setStatus('');
    } catch (error: any) {
      console.error('Video Generation Error:', error);
      alert(error.message || 'Video generation failed. Ensure you have selected a valid paid project API key.');
      setStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-extrabold gradient-text">Cinematic Video Synthesis</h1>
          <p className="text-slate-400">Powered by Veo 3.1 Fast - High-fidelity video generation.</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Visual Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-lg min-h-[160px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-700"
              placeholder="A futuristic cyber-city during a meteor shower, long cinematic tracking shot, 8k resolution, photorealistic..."
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Duration</span>
                <span className="text-sm font-medium px-3 py-1 bg-white/5 rounded-lg border border-white/10">~5-7 Seconds</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Resolution</span>
                <span className="text-sm font-medium px-3 py-1 bg-white/5 rounded-lg border border-white/10">720p / 16:9</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full md:w-auto px-12 py-4 rounded-2xl bg-white text-slate-950 font-bold hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-600"
            >
              {isGenerating ? 'Synthesizing...' : 'Generate Video'}
            </button>
          </div>

          {status && (
            <div className="mt-4 flex flex-col items-center gap-4 py-8">
              <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-400 text-sm italic animate-pulse text-center">{status}</p>
            </div>
          )}
        </div>

        {videoUrl && (
          <div className="glass rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <video controls autoPlay loop className="w-full aspect-video bg-black">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="p-4 bg-white/5 flex justify-between items-center">
              <span className="text-xs text-slate-500">Rendered with Veo-3.1-fast</span>
              <a href={videoUrl} download="luminary-veo.mp4" className="text-xs text-blue-400 font-bold hover:text-blue-300">Download HD Video</a>
            </div>
          </div>
        )}

        <div className="mt-12 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
           <h4 className="text-sm font-bold text-slate-500 mb-2">💡 Pro Tip</h4>
           <p className="text-xs text-slate-600 leading-relaxed">
             The video generation process can take up to 3 minutes. Veo works best with descriptive prompts that include camera movements (e.g., 'dolly zoom', 'slow pan') and lighting styles (e.g., 'cinematic lighting', 'golden hour').
           </p>
           <p className="text-[10px] text-slate-500 mt-2">
             Note: Ensure you have selected a valid paid project key. Link to billing: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">ai.google.dev/gemini-api/docs/billing</a>
           </p>
        </div>
      </div>
    </div>
  );
};
