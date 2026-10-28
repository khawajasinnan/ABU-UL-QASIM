import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import desferalImage from '../assets/IMG-20260605-WA0041.jpg';
import arfedImage from '../assets/IMG-20260605-WA0047.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MedicineDrive = () => {
    const [raised, setRaised] = useState(0);
    const [goal] = useState(5000000); // 50 Lakhs target
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [selectedAmount, setSelectedAmount] = useState(10000);
    const [customAmount, setCustomAmount] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('jazzcash');
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotPreview, setScreenshotPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleScreenshotChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setScreenshot(file);
            const reader = new FileReader();
            reader.onloadend = () => setScreenshotPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const fetchStats = () => {
            fetch(`${API_URL}/api/medicine-fund/stats`)
                .then(res => res.json())
                .then(data => {
                    if (data.totalRaised !== undefined) {
                        setRaised(data.totalRaised);
                    }
                })
                .catch(err => console.error("Could not fetch stats:", err));
        };
        
        // Initial fetch
        fetchStats();

        // Setup real-time polling every 3 seconds to catch Admin verifications automatically
        const intervalId = setInterval(fetchStats, 3000);

        return () => clearInterval(intervalId);
    }, []);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('amount', selectedAmount);
            formData.append('currency', 'PKR');
            formData.append('method', paymentMethod);
            formData.append('purpose', 'Medicine Drive');
            formData.append('donorName', donorName);
            formData.append('donorEmail', donorEmail);
            if (screenshot) {
                formData.append('screenshot', screenshot);
            }

            const response = await fetch(`${API_URL}/api/donate`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setSuccessMessage(`JazakAllah, ${donorName || 'Donor'}! Your donation of Rs. ${selectedAmount.toLocaleString()} was successful. It will help a Thalassemia patient get vital medicine.`);
                setDonorName('');
                setDonorEmail('');
                setScreenshot(null);
                setScreenshotPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                setTimeout(() => setSuccessMessage(''), 10000);
            } else {
                setSuccessMessage(data.error || 'Something went wrong.');
                setTimeout(() => setSuccessMessage(''), 10000);
            }
        } catch {
            setSuccessMessage('Network error. Please try again.');
            setTimeout(() => setSuccessMessage(''), 10000);
        } finally {
            setSubmitting(false);
        }
    };

    const percent = Math.min((raised / goal) * 100, 100);

    return (
        <div className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden bg-[linear-gradient(135deg,#fffaf5_0%,#fef3e2_100%)]">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
            >
                {/* Left Content Area: Image + Story */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, x: -50 },
                        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 50, damping: 20 } }
                    }}
                    className="space-y-8"
                >
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <motion.div
                            whileHover={{ y: -6, scale: 1.01 }}
                            className="group overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-[0_20px_50px_rgba(220,38,38,0.1)]"
                        >
                            <div className="overflow-hidden">
                                <img
                                    src={desferalImage}
                                    alt="Desferal medication"
                                    className="w-full h-[320px] md:h-[360px] object-cover transition duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-6 py-5 text-center text-red-50">
                                <p className="text-xs uppercase tracking-[0.3em] text-red-100 mb-2">Desferal</p>
                                <p className="text-lg font-semibold">Injection for iron chelation</p>
                            </div>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -6, scale: 1.01 }}
                            className="group overflow-hidden rounded-[2rem] border border-red-100 bg-white shadow-[0_20px_50px_rgba(220,38,38,0.1)]"
                        >
                            <div className="overflow-hidden">
                                <img
                                    src={arfedImage}
                                    alt="Arfed medication"
                                    className="w-full h-[320px] md:h-[360px] object-cover transition duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 px-6 py-5 text-center text-red-50">
                                <p className="text-xs uppercase tracking-[0.3em] text-red-100 mb-2">Arfed</p>
                                <p className="text-lg font-semibold">Oral iron chelation support</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="rounded-[2rem] border border-red-100 bg-gradient-to-br from-[#fff1f2] via-[#fff3f4] to-[#fff1f2] p-8 md:p-10 text-zinc-800 shadow-[0_20px_50px_rgba(220,38,38,0.06)]">
                        <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-4 inline-block">Emergency Appeal</span>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black plus-jakarta-sans leading-tight">Thalassemia <br /><span className="text-red-700 italic">Medicine Drive</span></h1>
                        <p className="mt-4 max-w-2xl text-sm md:text-base text-zinc-700 leading-relaxed">
                            Every donation helps provide life-saving chelation medicine for children who need ongoing care and support.
                        </p>
                    </div>

                    <div className="prose max-w-none text-zinc-600 leading-relaxed plus-jakarta-sans rounded-[1.5rem] border border-red-100 bg-[#fff8f8] p-6 md:p-8 shadow-sm">
                        <p className="text-lg font-semibold text-zinc-800">
                            Children with thalassemia not only require blood but also crucial medications to survive.
                        </p>
                        <p>
                            For those whose bodies cannot produce blood, when they receive external blood transfusions, it leads to an excess of iron in their bodies. To reduce this excess iron, medications are used, including the <strong>Desferal injection</strong>, which now costs over <strong>10,000 rupees</strong>.
                        </p>
                        <p>
                            Additionally, <strong>Arfed</strong> is used for iron chelation, and its price ranges from <strong>15,000 to 17,000 rupees</strong>. A pump is also used to remove iron, which costs between <strong>40,000 and 47,000 rupees</strong>.
                        </p>
                        <div className="my-8 rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
                            <p className="text-red-900 font-black text-lg mb-2">A Matter of Life and Death</p>
                            <p className="text-red-800">If these medications are not administered, the child could immediately die from iron overload. Due to the current inflation, many families are unable to afford these treatments.</p>
                        </div>
                        <p className="font-bold text-zinc-800 italic text-xl border-t border-zinc-200 pt-6">
                            "I request all of you to kindly adopt at least one or two children according to your ability. If that is not possible, please consider providing at least one medicine. Even if you can't do that, please contribute what you can to help."
                        </p>
                    </div>
                </motion.div>

                {/* Right Content Area: Progress & Donation Form */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, x: 50 },
                        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 50, damping: 20 } }
                    }}
                    className="bg-[#fffdf9] rounded-3xl p-8 border border-red-100 shadow-[0_20px_40px_rgba(220,38,38,0.06)] sticky top-32"
                >
                    <h2 className="text-2xl font-black plus-jakarta-sans mb-6">Live Fundraise Progress</h2>

                    {/* Progress Bar */}
                    <div className="mb-10">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <span className="text-3xl font-black text-red-700">Rs. {raised.toLocaleString()}</span>
                                <span className="text-zinc-500 font-medium ml-2">raised</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-zinc-700">Goal: Rs. {goal.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="w-full h-4 bg-red-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full relative"
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </motion.div>
                        </div>
                        <p className="text-xs font-bold text-zinc-400 mt-2 text-right">{percent.toFixed(1)}% Funded</p>
                    </div>

                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl mb-8 flex items-start gap-4 animate-in slide-in-from-top-4">
                            <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                            <p className="text-green-800 font-bold">{successMessage}</p>
                        </div>
                    )}

                    {/* Donation Configuration */}
                    <div className="mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Your Good Name</label>
                                <input
                                    type="text"
                                    value={donorName}
                                    onChange={(e) => setDonorName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-red-50/70 border border-red-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={donorEmail}
                                    onChange={(e) => setDonorEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-red-50/70 border border-red-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-3 mt-4">Select Amount to Sponsor</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[2000, 5000, 10000, 17000, 47000].map(amt => (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        key={amt}
                                        type="button"
                                        onClick={() => { setSelectedAmount(amt); setCustomAmount(false); }}
                                        className={`py-3 rounded-xl font-bold transition-all border-2 ${selectedAmount === amt && !customAmount ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-zinc-200 text-zinc-600 hover:border-red-300'}`}
                                    >
                                        Rs. {amt.toLocaleString()}
                                    </motion.button>
                                ))}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => setCustomAmount(true)}
                                    className={`py-3 rounded-xl font-bold transition-all border-2 ${customAmount ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-zinc-200 text-zinc-600 hover:border-red-300'}`}
                                >
                                    Custom
                                </motion.button>
                            </div>
                        </div>

                        {customAmount && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Custom Amount (Rs.)</label>
                                <input
                                    type="number"
                                    min="100"
                                    value={selectedAmount}
                                    onChange={(e) => setSelectedAmount(parseInt(e.target.value) || 0)}
                                    className="w-full bg-red-50/70 border border-red-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:outline-none transition-all font-bold text-lg"
                                />
                            </motion.div>
                        )}

                        <div className="pt-6 border-t border-zinc-100 mt-6">
                            <label className="block text-sm font-bold text-zinc-700 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-zinc-400">payments</span>
                                Manual Payment Transfer
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                <label className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'jazzcash' ? 'border-red-500 bg-red-50' : 'border-zinc-200 hover:bg-red-50/60'}`}>
                                    <input className="sr-only" name="payment" type="radio" checked={paymentMethod === 'jazzcash'} onChange={() => setPaymentMethod('jazzcash')} />
                                    <span className="font-bold text-sm">JazzCash</span>
                                </label>
                                <label className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'nayapay' ? 'border-red-500 bg-red-50' : 'border-zinc-200 hover:bg-red-50/60'}`}>
                                    <input className="sr-only" name="payment" type="radio" checked={paymentMethod === 'nayapay'} onChange={() => setPaymentMethod('nayapay')} />
                                    <span className="font-bold text-sm">NayaPay</span>
                                </label>
                                <label className={`flex items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'hbl' ? 'border-red-500 bg-red-50' : 'border-zinc-200 hover:bg-red-50/60'}`}>
                                    <input className="sr-only" name="payment" type="radio" checked={paymentMethod === 'hbl'} onChange={() => setPaymentMethod('hbl')} />
                                    <span className="font-bold text-sm">HBL</span>
                                </label>
                            </div>

                            <div className="mt-4 p-5 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-red-600">info</span>
                                    <p className="text-sm font-bold text-red-700">Send payment to the following number:</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">{paymentMethod === 'jazzcash' ? 'JazzCash' : paymentMethod === 'nayapay' ? 'NayaPay' : 'HBL Microfinance'} Account</p>
                                        <p className="text-2xl font-black text-red-900 tracking-wider">0323-8723663</p>
                                        <p className="text-sm text-red-800 mt-1">Account Title: <span className="font-bold text-red-900">Abdullah Zafar</span></p>
                                    </div>
                                    <button type="button" onClick={() => navigator.clipboard.writeText('03238723663')} className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors" title="Copy Number">
                                        <span className="material-symbols-outlined max-w-full">content_copy</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Upload Payment Screenshot</label>
                                <div className="border-2 border-dashed border-red-200 rounded-xl p-6 text-center hover:border-red-500 transition-colors bg-red-50/60 relative">
                                    <input type="file" required accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleScreenshotChange} ref={fileInputRef} />
                                    {screenshotPreview ? (
                                        <div className="flex flex-col items-center">
                                            <img src={screenshotPreview} alt="Screenshot preview" className="h-32 object-contain rounded-lg shadow-sm border border-zinc-200 mb-3" />
                                            <span className="text-sm font-bold text-red-700 bg-red-100 py-1 px-3 rounded-full">Change image</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-500">
                                            <span className="material-symbols-outlined text-4xl mb-2 text-zinc-400">cloud_upload</span>
                                            <p className="text-sm font-bold text-zinc-700 mb-1">Click or drag receipt here</p>
                                            <p className="text-xs">JPG, PNG, WEBP up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleManualSubmit}
                                disabled={submitting || !screenshot}
                                className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${submitting || !screenshot ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:-translate-y-1'}`}
                            >
                                {submitting ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">favorite</span>}
                                {submitting ? 'Processing Donation...' : `Donate Rs. ${selectedAmount.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default MedicineDrive;
