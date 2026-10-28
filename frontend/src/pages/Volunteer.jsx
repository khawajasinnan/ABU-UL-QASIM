import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import volunteersImage from '../assets/Volunteers.png';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Volunteer = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        occupation: '',
        bloodGroup: 'Unknown',
        availability: [],
        reason: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (submitting) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [submitting]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvailability = (slot) => {
        setFormData(prev => ({
            ...prev,
            availability: prev.availability.includes(slot)
                ? prev.availability.filter(s => s !== slot)
                : [...prev.availability, slot]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitResult(null);
        const start = Date.now();
        setSubmitting(true);
        let _ok = false;

        try {
            const response = await fetch(`${API_URL}/api/volunteer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                _ok = true;
                setSubmitResult({ type: 'success', message: data.message || 'Application submitted successfully!' });
                setFormData({ name: '', email: '', phone: '', occupation: '', bloodGroup: 'Unknown', availability: [], reason: '' });
                setAgreed(false);
            } else {
                setSubmitResult({ type: 'error', message: data.error || 'Something went wrong.' });
            }
        } catch {
            setSubmitResult({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            // Ensure spinner shows at least 2.2 seconds for better UX
            const minMs = 2200;
            const elapsed = Date.now() - start;
            if (elapsed < minMs) {
                await new Promise(r => setTimeout(r, minMs - elapsed));
            }
            setSubmitting(false);
            if (_ok) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2600);
            }
        }
    };

    return (
        <div className="overflow-hidden">
            {/* Hero Section with Vibrant Image and Red/Dark Gradient */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-red-950">
                    <img
                        src={volunteersImage}
                        alt="ABS Volunteers Action"
                        className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-950/80 via-zinc-900/60 to-zinc-950/90"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    >
                        <span className="text-red-400 font-black uppercase tracking-[0.3em] text-sm mb-4 block">Join ABS Network</span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 md:mb-8 plus-jakarta-sans drop-shadow-lg">
                            Prove that <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300 italic">Humanity is Alive.</span>
                        </h1>
                        <div className="text-lg text-zinc-300 leading-relaxed space-y-6 plus-jakarta-sans">
                            <p>
                                You too can now be part of the team (ABS) in the struggle to make Pakistan better by doing small things for your beloved country Pakistan for the betterment of your next generation. Come and prove that humanity is alive in you.
                            </p>
                            <p>
                                (ABS) Pakistan is also dealing with emergency cases on a daily basis. In addition, it also conducts blood games for children affected by thalassemia. <strong className="text-white">ABS donates about 30,000 + blood bags to children affected by thalassemia annually</strong> and donates blood to eight to 10 donors daily.
                            </p>
                            <p>
                                For emergency cases, we receive more than 100 cases in each city, every day in which about 70 to 80 percent donors are provided.
                            </p>
                        </div>
                    </motion.div>

                    {/* Registration Form Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 md:p-12 rounded-[2rem] border border-zinc-100 shadow-2xl card-interactive"
                        id="register"
                    >
                        <h2 className="text-3xl font-black text-zinc-900 mb-2 plus-jakarta-sans">Volunteer Application</h2>
                        <p className="text-zinc-500 mb-8">Fill out the form to join the ABS force.</p>

                        {submitResult && (
                            <div className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-3 ${submitResult.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <span className="material-symbols-outlined">
                                    {submitResult.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {submitResult.message}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Full Name</label>
                                    <input required value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all" type="text" placeholder="Ali Raza" />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Occupation</label>
                                    <input value={formData.occupation} onChange={e => handleChange('occupation', e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all" type="text" placeholder="e.g., Student, Doctor, Engineer" />
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Blood Group</label>
                                    <select value={formData.bloodGroup} onChange={e => handleChange('bloodGroup', e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all">
                                        <option>Unknown</option>
                                        <option>A+</option><option>A-</option>
                                        <option>B+</option><option>B-</option>
                                        <option>O+</option><option>O-</option>
                                        <option>AB+</option><option>AB-</option>
                                    </select>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Email Address</label>
                                    <input required value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all" type="email" placeholder="ali@example.com" />
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                                    <label className="block text-sm font-bold text-zinc-700 mb-2">Phone Number</label>
                                    <input required value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all" type="tel" placeholder="0300-1234567" />
                                </motion.div>
                            </div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                                <label className="block text-sm font-bold text-zinc-700 mb-3">Availability (Check all that apply)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Weekdays', 'Weekends', 'Evenings', 'Emergencies'].map(slot => (
                                        <label key={slot} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.availability.includes(slot) ? 'border-red-600 bg-red-50 text-red-700 shadow-md transform -translate-y-1' : 'border-zinc-200 hover:border-red-300 hover:bg-red-50/30 text-zinc-600 hover:-translate-y-0.5'}`}>
                                            <input type="checkbox" className="hidden" checked={formData.availability.includes(slot)} onChange={() => handleAvailability(slot)} />
                                            <span className="font-bold text-sm">{slot}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                                <label className="block text-sm font-bold text-zinc-700 mb-2">Why do you want to join ABS?</label>
                                <textarea required value={formData.reason} onChange={e => handleChange('reason', e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-600 focus:outline-none transition-all h-24 resize-none" placeholder="Share your motivation..."></textarea>
                            </motion.div>

                            <motion.label initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex items-start gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200 cursor-pointer hover:border-red-300 transition-colors">
                                <input type="checkbox" required checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-600" />
                                <span className="text-sm text-zinc-600 leading-relaxed font-medium">I pledge to respond to emergency requests if available and handle all patient information with absolute confidentiality.</span>
                            </motion.label>

                                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} type="submit" disabled={!agreed || submitting} className={`btn-primary w-full justify-center ${submitting ? 'opacity-80 pointer-events-none' : ''}`}>
                                {submitting ? 'Submitting Application...' : 'Submit Application'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* Centered submission spinner overlay */}
            {submitting && (
                <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center">
                    <div className="absolute inset-0 bg-white"></div>
                    <div className="relative z-50 flex items-center justify-center h-full">
                        <div className="loader" aria-hidden></div>
                    </div>
                </div>
            )}
            {/* Success overlay */}
            {showSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10001] flex items-center justify-center bg-white">
                    <motion.div initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 14 }} className="w-40 h-40 bg-red-600 rounded-full flex items-center justify-center shadow-2xl text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16">
                            <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.div>
                    <div className="pointer-events-none absolute inset-0">
                        <motion.span initial={{ opacity: 0, y: 0 }} animate={{ opacity: 0.9, y: -40 }} transition={{ duration: 0.9 }} className="absolute left-1/3 bottom-1/3 w-3 h-3 bg-red-300 rounded-full" />
                        <motion.span initial={{ opacity: 0, y: 0 }} animate={{ opacity: 0.9, y: -60 }} transition={{ duration: 1.1 }} className="absolute right-1/3 bottom-1/3 w-3 h-3 bg-yellow-300 rounded-full" />
                        <motion.span initial={{ opacity: 0, y: 0 }} animate={{ opacity: 0.9, y: -80 }} transition={{ duration: 1.3 }} className="absolute left-1/2 bottom-1/2 w-2 h-2 bg-white rounded-full" />
                    </div>
                </motion.div>
            )}
            
        </div>
    );
};

export default Volunteer;
