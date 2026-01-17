
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

export const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          }
        },
      });

      // Correctly iterate through response parts to find image data as it may not be the first part
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content.parts || []) {
          if (part.inlineData) {
            setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Image Error:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full bg-slate-950 overflow-hidden flex-col md:flex-row">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 border-r border-white/5 glass p-6 overflow-y-auto space-y-8 order-2 md:order-1">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Prompt</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm min-h-[120px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="A surreal landscape with floating islands and neon waterfalls..."
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Aspect Ratio</h3>
          <div className="grid grid-cols-2 gap-2">
            {['1:1', '16:9', '9:16', '3:4', '4:3'].map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  aspectRatio === ratio ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Imagining...
            </span>
          ) : 'Generate Masterpiece'}
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-900/50 p-6 md:p-12 flex items-center justify-center order-1 md:order-2">
        <div className="max-w-full max-h-full aspect-square md:aspect-auto w-full max-w-2xl relative group">
          {generatedImage ? (
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10">
              <img src={generatedImage} alt="Generated" className="w-full h-auto object-contain" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <a href={generatedImage} download="luminary-image.png" className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="w-full h-96 md:h-[600px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-center px-8">Your creation will appear here.<br/>Enter a prompt to begin the journey.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
