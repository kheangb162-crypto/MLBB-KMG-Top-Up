
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface DiamondPackage {
  id: number;
  amount: string;
  price: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const MLBB_ICON_URL = "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/3c/6f/30/3c6f30a6-579c-b016-b8b8-077a493a778c/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg";
const THANK_YOU_IMG = "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800";
const MOCK_QR_URL = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=KMGSTUDIO-MLBB-TOPUP-PAYMENT";

const DiamondIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L4.5 9L12 22L19.5 9L12 2Z" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 2L8 9L12 22L16 9L12 2Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M4.5 9H19.5" stroke="#2563EB" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const TechIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} animate-spin`}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" className="opacity-20" />
    <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4522" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" className="animate-pulse" />
  </svg>
);

const packages: DiamondPackage[] = [
  { id: 1, amount: "55 Diamond", price: "1.00$" },
  { id: 2, amount: "165 Diamond", price: "2.50$" },
  { id: 3, amount: "343 Diamond", price: "4.79$" },
  { id: 4, amount: "429 Diamond", price: "5.80$" },
  { id: 5, amount: "514 Diamond", price: "7.00$" },
  { id: 6, amount: "600 Diamond", price: "8.00$" },
  { id: 7, amount: "706 Diamond", price: "9.50$" },
  { id: 8, amount: "878 Diamond", price: "12.00$" },
  { id: 9, amount: "963 Diamond", price: "13.15$" },
  { id: 10, amount: "1135 Diamond", price: "14.90$" },
];

const App: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<DiamondPackage | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('ABA');
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [idError, setIdError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNameChecked, setIsNameChecked] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);

  // AI Chat State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Message[]>([
    { role: 'model', content: "សួស្តី! ខ្ញុំជាជំនួយការ KMG AI។ តើខ្ញុំអាចជួយអ្វីអ្នកបានខ្លះអំពីការទិញ Diamond ឬ Skins? (Hello! I'm KMG AI. How can I help you with diamonds or skins?)" }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const isIdValid = userId.length >= 8 && zoneId.length >= 4;
  const isVerified = isNameChecked && isIdValid;

  const handleIdChange = (val: string, type: 'user' | 'zone') => {
    const numericVal = val.replace(/\D/g, '');
    if (type === 'user') setUserId(numericVal);
    else setZoneId(numericVal);
    setIsNameChecked(false);
    setIdError('');
  };

  const handleCheckName = () => {
    if (!userId || !zoneId) {
      setIdError('សូមបញ្ចូល User ID និង Zone ID');
      return;
    }
    setIdError('');
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setIsNameChecked(true);
    }, 1200);
  };

  const handleGoToCheckout = () => {
    if (!isVerified || !selectedPackage) {
      setIdError('សូមពិនិត្យ ID និងជ្រើសរើសកញ្ចប់ Diamond!');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowCheckout(true);
    }, 1000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowCheckout(false);
      setShowSuccessPage(true);
    }, 2000);
  };

  const handleAiSend = async () => {
    if (!aiInput.trim() || isAiLoading) return;

    const userMsg = aiInput;
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are KMG AI, a specialized assistant for the KMG Top Up portal and Mobile Legends: Bang Bang. You help users understand diamond prices, suggest skins, and explain how to top up. Be friendly and helpful. Respond in Khmer when appropriate, or English if the user prefers. Keep responses concise.",
        }
      });
      
      const text = response.text || "សុំទោស ខ្ញុំមិនយល់ពីសំណួររបស់អ្នកទេ។";
      setAiMessages(prev => [...prev, { role: 'model', content: text }]);
    } catch (error) {
      console.error(error);
      setAiMessages(prev => [...prev, { role: 'model', content: "មានបញ្ហាបច្ចេកទេសបន្តិចបន្តួច។ សូមព្យាយាមម្តងទៀត។" }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetShop = () => {
    setShowSuccessPage(false);
    setShowCheckout(false);
    setUserId('');
    setZoneId('');
    setSelectedPackage(null);
    setIsNameChecked(false);
    setIdError('');
  };

  if (showSuccessPage) {
    return (
      <div className="min-h-screen bg-[#fdf2f8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-white animate-in zoom-in-95 duration-500 text-center">
          <div className="relative border-4 border-pink-100 rounded-[2.5rem] p-6 bg-pink-50/30">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-800 khmer-text mb-2 tracking-tighter">សូមអរគុណ</h2>
            <p className="text-[#d946ef] font-black khmer-text text-xl uppercase italic tracking-widest">Victory!</p>
          </div>
          <p className="mt-8 text-slate-500 khmer-text font-bold leading-relaxed">
            ការបង់ប្រាក់ជោគជ័យ! <br/> Diamond នឹងផ្ញើទៅគណនីរបស់អ្នកភ្លាមៗ។
          </p>
          <button onClick={resetShop} className="w-full mt-8 bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all">
            <span className="khmer-text text-xl">បន្តការទិញទំនិញ</span>
          </button>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-[#fdf2f8] flex items-center justify-center p-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-[3rem] p-6 md:p-10 shadow-2xl border border-pink-100 animate-in slide-in-from-bottom-10 duration-500">
           <header className="flex justify-between items-center mb-8">
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-pink-50 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-2xl font-black text-slate-800 khmer-text tracking-tighter uppercase">ការទូទាត់ប្រាក់</h2>
              <div className="w-10"></div>
           </header>

           <div className="space-y-6">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                 <div className="space-y-2">
                    <div className="flex justify-between">
                       <span className="text-slate-500 khmer-text font-bold">User ID</span>
                       <span className="text-slate-900 font-black tracking-tight">{userId} ({zoneId})</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-500 khmer-text font-bold">Diamond</span>
                       <span className="text-slate-900 font-black">{selectedPackage?.amount}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-200 mt-2 flex justify-between items-center">
                       <span className="text-slate-900 font-black text-lg khmer-text">សរុបប្រាក់</span>
                       <span className="text-[#d946ef] font-black text-2xl tracking-tighter">{selectedPackage?.price}</span>
                    </div>
                 </div>
              </div>

              {selectedPayment === 'KHQR' ? (
                <div className="flex flex-col items-center gap-6">
                   <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-red-500 relative overflow-hidden">
                      <img src={MOCK_QR_URL} alt="KHQR" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
                   </div>
                   <p className="khmer-text font-black text-slate-800 text-lg">សូមស្កែន QR Code ដើម្បីបង់ប្រាក់</p>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="bg-[#005a81] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                      <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-70 mb-6">ABA BANK TRANSFER</p>
                      <div className="space-y-4">
                         <div>
                            <p className="text-[9px] font-bold opacity-60 uppercase mb-1">Account Name</p>
                            <p className="text-2xl font-black uppercase tracking-tighter">KMG STUDIO CO., LTD</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-bold opacity-60 uppercase mb-1">Account Number</p>
                            <p className="text-3xl font-black tracking-[0.1em]">000 888 999</p>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              <button 
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
              >
                {isProcessing ? <TechIcon className="w-6 h-6" /> : <span className="khmer-text text-lg">ខ្ញុំបានបង់ប្រាក់រួចហើយ</span>}
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-32 animate-in fade-in duration-500 relative">
      <header className="bg-[#d946ef] p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-2xl p-1.5 shadow-md">
            <img src={MLBB_ICON_URL} alt="Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <h1 className="text-white font-black text-xl tracking-tighter uppercase italic hidden sm:block">KMG Top Up</h1>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-10 py-1.5 rounded-full border border-white/30 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-white font-bold text-xs uppercase tracking-widest">Store Online</span>
        </div>
        <div className="w-11 h-11"></div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="space-y-6">
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-pink-100/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#d946ef] text-white flex items-center justify-center font-black shadow-lg shadow-pink-200">1</div>
              <h3 className="khmer-text font-black text-slate-800 text-lg uppercase tracking-tight">ព័ត៌មានគណនី</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="User ID" value={userId} onChange={(e) => handleIdChange(e.target.value, 'user')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-[#d946ef] outline-none font-bold" />
              <input type="text" placeholder="Zone ID" value={zoneId} onChange={(e) => handleIdChange(e.target.value, 'zone')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-[#d946ef] outline-none font-bold" />
            </div>
            <button onClick={handleCheckName} disabled={isProcessing} className={`w-full py-4 rounded-2xl font-black text-white transition-all ${isVerified ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-black'}`}>
              {isProcessing ? <TechIcon className="w-5 h-5 mx-auto" /> : <span className="khmer-text">{isVerified ? 'ឈ្មោះត្រឹមត្រូវ ✓' : 'ពិនិត្យឈ្មោះអ្នកប្រើ'}</span>}
            </button>
            {idError && <p className="text-red-500 text-[10px] khmer-text text-center font-bold mt-2 uppercase">{idError}</p>}
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-pink-100/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#d946ef] text-white flex items-center justify-center font-black shadow-lg shadow-pink-200">2</div>
              <h3 className="khmer-text font-black text-slate-800 text-lg uppercase tracking-tight">វិធីសាស្ត្របង់ប្រាក់</h3>
            </div>
            <div className="space-y-4">
              {['ABA', 'KHQR'].map(method => (
                <button key={method} onClick={() => setSelectedPayment(method)} className={`w-full p-5 rounded-[1.75rem] border-2 flex items-center justify-between transition-all ${selectedPayment === method ? 'border-[#d946ef] bg-pink-50' : 'border-slate-100'}`}>
                  <span className="font-black text-slate-800 uppercase tracking-tight">{method === 'ABA' ? 'ABA Bank' : 'KHQR Bakong'}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === method ? 'border-[#d946ef]' : 'border-slate-200'}`}>
                    {selectedPayment === method && <div className="w-3 h-3 bg-[#d946ef] rounded-full"></div>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white rounded-[3rem] p-8 shadow-sm border border-pink-100/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-[#d946ef] text-white flex items-center justify-center font-black shadow-lg shadow-pink-200">3</div>
            <h3 className="khmer-text font-black text-slate-800 text-lg uppercase tracking-tight">ជ្រើសរើស Diamond</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scroll">
            {packages.map(pkg => (
              <button key={pkg.id} onClick={() => setSelectedPackage(pkg)} className={`p-5 rounded-[2rem] border-2 text-left transition-all ${selectedPackage?.id === pkg.id ? 'border-[#d946ef] bg-pink-50 ring-4 ring-pink-100' : 'border-slate-50 bg-slate-50/50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <DiamondIcon className="w-6 h-6" />
                  <span className="font-black italic text-slate-800">{pkg.amount.split(' ')[0]}</span>
                </div>
                <p className="text-xl font-black text-slate-800">{pkg.price}</p>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Floating AI Button */}
      <button 
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-32 right-8 w-16 h-16 bg-[#d946ef] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <div className="absolute -top-2 -right-2 bg-pink-400 text-[8px] font-black px-2 py-1 rounded-full animate-pulse border-2 border-white uppercase tracking-widest">Free AI</div>
        <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </button>

      {/* AI Chat Panel */}
      {isAiOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAiOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-20">
            <header className="p-6 border-b flex justify-between items-center bg-pink-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d946ef] rounded-2xl flex items-center justify-center text-white font-black text-sm">AI</div>
                <div>
                  <h4 className="font-black text-slate-800 leading-none">KMG AI Assistant</h4>
                  <p className="text-[10px] font-bold text-[#d946ef] uppercase tracking-widest mt-1">Free Elite Helper</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll">
              {aiMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${m.role === 'user' ? 'bg-[#d946ef] text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}>
                    <p className="khmer-text leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#d946ef] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#d946ef] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#d946ef] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t bg-white">
              <div className="relative group">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                  placeholder="Ask KMG AI anything..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-6 pr-16 focus:border-[#d946ef] outline-none transition-all font-bold text-sm"
                />
                <button 
                  onClick={handleAiSend}
                  disabled={!aiInput.trim() || isAiLoading}
                  className="absolute right-2 top-2 w-10 h-10 bg-[#d946ef] text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">Powered by Gemini 3 Flash</p>
            </div>
          </div>
        </div>
      )}

      {selectedPackage && (
        <div className="fixed bottom-10 left-4 right-4 max-w-2xl mx-auto z-[60] animate-in slide-in-from-bottom-20 duration-500">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.75rem] p-4 shadow-[0_25px_60px_rgba(217,70,239,0.3)] border border-white flex items-center justify-between">
            <div className="flex items-center gap-5 pl-4">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center border border-pink-100">
                <DiamondIcon className="w-9 h-9" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Grand Total</p>
                <span className="text-2xl font-black text-[#d946ef] tracking-tighter">{selectedPackage.price}</span>
              </div>
            </div>
            <button onClick={handleGoToCheckout} disabled={isProcessing || !isVerified} className={`px-12 py-5 rounded-[1.75rem] font-black text-white shadow-2xl transition-all uppercase italic tracking-tighter ${isVerified ? 'bg-[#d946ef] hover:scale-[1.03]' : 'bg-slate-300 grayscale'}`}>
              <span className="khmer-text text-base">បង់ប្រាក់</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
