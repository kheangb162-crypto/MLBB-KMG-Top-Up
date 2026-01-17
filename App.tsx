
import React, { useState } from 'react';

interface DiamondPackage {
  id: number;
  amount: string;
  price: string;
}

const MLBB_ICON_URL = "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/3c/6f/30/3c6f30a6-579c-b016-b8b8-077a493a778c/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg";
const THANK_YOU_IMG = "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800";

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
    <path d="M12 7V5M12 19V17M7 12H5M19 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
  const [showSuccessPage, setShowSuccessPage] = useState(false);

  // Validation: User ID (9-10 digits) and Zone ID (4-5 digits)
  const isUserIdLengthValid = userId.length >= 9 && userId.length <= 10;
  const isZoneIdLengthValid = zoneId.length >= 4 && zoneId.length <= 5;
  const isIdValid = /^\d+$/.test(userId) && /^\d+$/.test(zoneId) && isUserIdLengthValid && isZoneIdLengthValid;

  const handleIdChange = (val: string, type: 'user' | 'zone') => {
    // Force only digits in the state
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
    if (!isUserIdLengthValid) {
      setIdError('User ID ត្រូវមានចន្លោះពី 9 ទៅ 10 ខ្ទង់');
      return;
    }
    if (!isZoneIdLengthValid) {
      setIdError('Zone ID ត្រូវមានចន្លោះពី 4 ទៅ 5 ខ្ទង់');
      return;
    }

    setIdError('');
    setIsProcessing(true);
    // Simulated check
    setTimeout(() => {
        setIsProcessing(false);
        setIsNameChecked(true);
        alert(`រកឃើញគណនីរបស់អ្នករួចរាល់! (Account Found!)`);
    }, 1200);
  };

  const handlePay = () => {
    if (!isIdValid || !isNameChecked) {
      setIdError('សូមបញ្ចូល ID ឱ្យបានត្រឹមត្រូវ និងចុច Check Name!');
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessPage(true);
    }, 2000);
  };

  const resetShop = () => {
    setShowSuccessPage(false);
    setUserId('');
    setZoneId('');
    setSelectedPackage(null);
    setIsNameChecked(false);
    setIdError('');
  };

  if (showSuccessPage) {
    return (
      <div className="min-h-screen bg-[#fdf2f8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-white animate-in zoom-in-95 duration-500">
          <div className="border-4 border-pink-100 rounded-[2rem] overflow-hidden p-2">
            <div className="relative rounded-[1.5rem] overflow-hidden aspect-square flex flex-col items-center justify-center bg-pink-50">
              <img src={THANK_YOU_IMG} alt="Thank You" className="absolute inset-0 w-full h-full object-cover opacity-20" />
              <div className="relative z-10 text-center space-y-4 p-6">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-[#d946ef] uppercase italic tracking-wider khmer-text">អរគុណច្រើន!</h2>
                <p className="text-slate-600 font-bold khmer-text leading-relaxed">
                  ការទិញរបស់អ្នកបានជោគជ័យហើយ។ <br/> Diamond នឹងត្រូវបានបញ្ចូលទៅក្នុងគណនីរបស់អ្នកភ្លាមៗ!
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={resetShop}
            className="w-full mt-8 bg-gradient-to-r from-[#d946ef] to-pink-500 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
          >
            <span className="khmer-text">Continue to Shop</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-24 animate-in fade-in duration-500">
      {/* Header Banner */}
      <header className="bg-[#d946ef] p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="w-12 h-12 bg-white rounded-full border-2 border-white flex items-center justify-center overflow-hidden shadow-lg transform hover:scale-110 transition-transform">
          <img src={MLBB_ICON_URL} alt="MLBB Logo" className="w-full h-full object-cover" />
        </div>
        <div className="bg-white px-10 py-2 rounded-full shadow-inner flex items-center gap-2">
          <h1 className="text-[#d946ef] font-bold text-lg tracking-tight">KMG Top Up</h1>
        </div>
        <div className="w-12 h-12 bg-white rounded-full border-2 border-white flex items-center justify-center overflow-hidden shadow-lg transform hover:scale-110 transition-transform">
          <img src={MLBB_ICON_URL} alt="MLBB Logo" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative w-full max-w-4xl mx-auto px-4 mt-4">
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-[#d946ef]/20 relative">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200" 
            alt="MLBB Hero Banner" 
            className="w-full h-48 md:h-80 object-cover"
          />
          <div className="absolute top-4 right-8 pointer-events-none">
            <h2 className="text-4xl font-black text-cyan-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] italic uppercase">KMG Top Up</h2>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <img src={MLBB_ICON_URL} alt="ML Icon" className="w-12 h-12 rounded-xl shadow-lg border border-white/50" />
            <div className="text-white drop-shadow-md">
              <h3 className="font-bold text-xl leading-none uppercase">MOBILE LEGENDS</h3>
              <p className="text-xs font-medium tracking-[0.2em] opacity-80 uppercase">BANG BANG</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 mt-6">
        {/* Left Column: Account Info */}
        <div className="space-y-8">
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-pink-100 relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#f472b6] text-white flex items-center justify-center font-bold text-xl shadow-inner">1</div>
              <h2 className="text-slate-700 font-bold text-lg khmer-text uppercase">ព័ត៌មានរបស់ខ្ញុំ (Account Info)</h2>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="User ID" 
                  value={userId}
                  maxLength={10}
                  onChange={(e) => handleIdChange(e.target.value, 'user')}
                  className={`w-full bg-pink-50/50 border-2 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all placeholder:text-pink-300 text-black font-medium ${idError && !userId ? 'border-red-400' : 'border-pink-200'}`}
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Zone ID" 
                  value={zoneId}
                  maxLength={5}
                  onChange={(e) => handleIdChange(e.target.value, 'zone')}
                  className={`w-full bg-pink-50/50 border-2 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all placeholder:text-pink-300 text-black font-medium ${idError && !zoneId ? 'border-red-400' : 'border-pink-200'}`}
                />
              </div>
              <div className="space-y-2">
                <button 
                  onClick={handleCheckName}
                  disabled={isProcessing}
                  className={`w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group ${isProcessing ? 'opacity-50' : ''}`}
                >
                  {isProcessing && !isNameChecked ? <TechIcon className="w-5 h-5" /> : null}
                  <span className="khmer-text uppercase">{isNameChecked ? 'Account Checked ✓' : 'Check name'}</span>
                </button>
                {idError && (
                  <p className="text-red-500 text-xs font-bold pl-2 animate-pulse transition-opacity khmer-text">
                    {idError}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-4 text-[10px] text-pink-400 text-center leading-relaxed khmer-text">
              សូមបញ្ចូល User ID & Zone ID ឱ្យបានត្រឹមត្រូវ រួចចុច Check Name ដើម្បីបន្តការទិញ Diamond។
            </p>
          </section>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 flex gap-4 items-start">
             <img src={MLBB_ICON_URL} className="w-14 h-14 rounded-2xl shadow-md border border-pink-100" alt="ml" />
             <div>
               <h3 className="font-bold text-[#d946ef] mb-1">Mobile Legends Bang Bang</h3>
               <p className="text-xs text-slate-500 leading-relaxed khmer-text">
                 ទិញ Diamond Mobile Legends: Bang Bang ក្នុងតម្លៃសមរម្យបំផុត! កាន់តែងាយស្រួល ជាមួយការទូទាត់ប្រាក់ភ្លាមៗ។
               </p>
             </div>
          </div>
        </div>

        {/* Right Column: Packages & Payment */}
        <div className="space-y-8">
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-pink-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#f472b6] text-white flex items-center justify-center font-bold text-xl shadow-inner">2</div>
              <h2 className="text-slate-700 font-bold text-lg khmer-text uppercase">ជ្រើសរើសតម្លៃ (Select Value)</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left group ${
                    selectedPackage?.id === pkg.id 
                    ? 'border-[#d946ef] bg-pink-50' 
                    : 'border-pink-100 hover:border-pink-200 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                    <DiamondIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold leading-tight ${selectedPackage?.id === pkg.id ? 'text-[#d946ef]' : 'text-slate-600'}`}>
                      {pkg.amount}
                    </p>
                    <p className="text-xs font-bold text-yellow-600">{pkg.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-pink-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#f472b6] text-white flex items-center justify-center font-bold text-xl shadow-inner">3</div>
              <h2 className="text-slate-700 font-bold text-lg khmer-text uppercase">វិធីសាស្ត្របង់ប្រាក់ (Payment Method)</h2>
            </div>
            <div className="space-y-3">
              {['ABA', 'KHQR'].map(method => (
                <button 
                  key={method}
                  onClick={() => setSelectedPayment(method)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selectedPayment === method ? 'border-[#d946ef] bg-pink-50' : 'border-pink-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-[10px] uppercase p-1 text-center leading-none ${method === 'ABA' ? 'bg-[#005a81]' : 'bg-red-500'}`}>
                      {method === 'ABA' ? 'ABA PAY' : 'KH QR'}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-slate-700">{method === 'ABA' ? 'ABA PAY' : 'KH QR PAY'}</p>
                      <p className="text-[10px] text-slate-400 khmer-text italic">Scan to pay instantly</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPayment === method ? 'border-[#d946ef]' : 'border-slate-200'}`}>
                    {selectedPayment === method && <div className="w-3 h-3 bg-[#d946ef] rounded-full"></div>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Floating Footer Selection Bar */}
      {selectedPackage && (
        <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto glass rounded-3xl p-4 shadow-2xl border border-white/40 flex items-center justify-between z-50 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-pink-100 shadow-sm">
              <DiamondIcon className="w-7 h-7" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-700">{selectedPackage.amount}</p>
              <p className="text-xs font-bold text-[#d946ef]">{selectedPackage.price}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1 flex-1 ml-4">
            <button 
              onClick={handlePay}
              disabled={isProcessing || !selectedPackage}
              className={`w-full sm:w-auto min-w-[180px] font-bold py-3 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group ${
                !isIdValid || !isNameChecked
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed grayscale'
                : 'bg-red-500 hover:bg-red-600 text-white hover:scale-[1.02]'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-3">
                  <TechIcon className="w-6 h-6" />
                  <span className="khmer-text text-sm">កំពុងដំណើរការ...</span>
                </div>
              ) : (
                <>
                  <span className="font-bold khmer-text text-sm uppercase">បង់ប្រាក់ឥឡូវនេះ</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
            {!isNameChecked && isIdValid && (
              <p className="text-[9px] text-pink-500 font-bold khmer-text animate-bounce">ចុច "Check name" ជាមុនសិន</p>
            )}
            {!isIdValid && (
              <p className="text-[9px] text-red-500 font-bold khmer-text">សូមបញ្ជូល User ID & Zone ID</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
