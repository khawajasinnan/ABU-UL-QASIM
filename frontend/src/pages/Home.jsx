import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QuoteCarousel from '../components/QuoteCarousel';
import homeImage from '../assets/home.png';

const Home = () => {
    const stats = { lives: "120k", donors: "8.5k" };

    // Animated numeric counter (formats thousands as k+)
    const AnimatedCount = ({ target = 0, duration = 1200 }) => {
        const [value, setValue] = useState(0);
        useEffect(() => {
            let rafId;
            const start = performance.now();
            const loop = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const current = Math.floor(progress * target);
                setValue(current);
                if (progress < 1) rafId = requestAnimationFrame(loop);
            };
            rafId = requestAnimationFrame(loop);
            return () => cancelAnimationFrame(rafId);
        }, [target, duration]);

        const format = (n) => {
            if (n >= 1000000) return `${Math.round(n / 1000000)}M+`;
            if (n >= 1000) return `${Math.round(n / 1000)}k+`;
            return `${n}+`;
        };

        return <>{format(value)}</>;
    };
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);


    const [liveTotal, setLiveTotal] = useState(0);
    const [bloodRaised, setBloodRaised] = useState(0);
    const [medRaised, setMedRaised] = useState(0);

    const fetchDonationTotals = async () => {
        try {
            const res = await fetch(`${API_URL}/api/donations/live`);
            const data = await res.json();
            if (data.success) {
                setLiveTotal(2450000 + Number(data.liveTotal || 0));
                setMedRaised(Number(data.medicineRaised || 0));
                setBloodRaised(Number(data.bloodRaised || 0));
            }
        } catch (e) {
            console.error('Failed to fetch live totals', e);
            setLiveTotal(2450000);
        }
    };

    useEffect(() => {
        fetchDonationTotals();
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        try {
            const res = await fetch(`${API_URL}/api/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setSubscribed(true);
                setEmail('');
                setTimeout(() => setSubscribed(false), 8000);
            }
        } catch (err) {
            console.error('Subscription failed:', err);
        }
    };

    

    return (
        <div className="overflow-hidden">
            {/* High-Impact Hero Section */}
            <section className="relative min-h-[100svh] md:min-h-[870px] flex items-center overflow-hidden px-4 md:px-8 py-20 md:py-0">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="md:col-span-7 z-10"
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-8xl font-black plus-jakarta-sans leading-[0.9] tracking-tighter text-on-surface mb-6 md:mb-8">
                            Your Blood, <br /> <span className="text-primary italic">Their Hope.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-on-surface-variant max-w-xl mb-8 md:mb-10 leading-relaxed">
                            Join the prestigious circle of lifesavers. Every donation at Abu-ul-Qasim Blood Donation Society provides a lifeline for emergency surgeries, cancer treatments, and thalassemia patients.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/volunteer" className="btn-primary flex items-center justify-center gap-2">
                                <span>Volunteer Now!</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                            <Link to="/donate-blood" className="btn-ghost">
                                Donate Blood
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 50 }}
                        className="md:col-span-5 relative"
                    >
                        <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl relative">
                            <img alt="Blood Donation Process" className="w-full h-full object-cover" src={homeImage} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                        {/* Overlapping Stat Card */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="absolute -bottom-6 -left-12 glass-card p-8 rounded-2xl shadow-2xl max-w-xs border border-white/20 hidden lg:block"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary plus-jakarta-sans">LIVES IMPACTED</p>
                                    <p className="text-3xl font-extrabold plus-jakarta-sans">12,482+</p>
                                </div>
                            </div>
                            <p className="text-sm text-on-surface-variant italic">"The process was seamless and the staff made me feel like a hero." - Sarah J.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Quotes / Testimonials */}
            <section className="py-20 px-6 bg-surface-container-low">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold plus-jakarta-sans mb-4">Voices of Hope</h2>
                    <p className="text-on-surface-variant mb-8">Real stories from donors, volunteers, and families touched by ABS.</p>
                    <QuoteCarousel />
                </div>
            </section>

            {/* Statistical Counters Section */}
            <section className="py-16 md:py-24 bg-surface-container-low overflow-hidden">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                    }}
                    className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center"
                >
                    <motion.div
                        variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } } }}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-4xl sm:text-5xl md:text-7xl font-black plus-jakarta-sans text-primary"><AnimatedCount target={100000} /></span>
                        <span className="text-xs sm:text-sm font-bold tracking-widest text-on-surface-variant uppercase plus-jakarta-sans">Units Collected</span>
                    </motion.div>
                    <motion.div
                        variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } } }}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-4xl sm:text-5xl md:text-7xl font-black plus-jakarta-sans text-primary">{stats.lives}</span>
                        <span className="text-xs sm:text-sm font-bold tracking-widest text-on-surface-variant uppercase plus-jakarta-sans">Lives Saved</span>
                    </motion.div>
                    <motion.div
                        variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } } }}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-4xl sm:text-5xl md:text-7xl font-black plus-jakarta-sans text-primary">{stats.donors}</span>
                        <span className="text-xs sm:text-sm font-bold tracking-widest text-on-surface-variant uppercase plus-jakarta-sans">Registered Donors</span>
                    </motion.div>
                    <motion.div
                        variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } } }}
                        className="flex flex-col gap-2"
                    >
                        <span className="text-5xl md:text-7xl font-black plus-jakarta-sans text-primary"><AnimatedCount target={100} /></span>
                        <span className="text-sm font-bold tracking-widest text-on-surface-variant uppercase plus-jakarta-sans">Active Drives</span>
                    </motion.div>
                </motion.div>
            </section>

            {/* Impact & Transparency Section */}
            <section className="py-32 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black plus-jakarta-sans mb-4">Recent Donations Raised</h2>
                            <p className="text-lg text-on-surface-variant">Transparency is our core value. See how your financial contributions power our logistics and medical equipment.</p>
                        </div>
                        <Link to="/gallery" className="text-primary font-bold flex items-center gap-2 group underline underline-offset-8">
                            View All Campaigns <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="glass-card p-10 rounded-3xl shadow-2xl border border-white/60 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className="bg-primary/5 p-4 rounded-2xl">
                                    <span className="material-symbols-outlined text-primary text-4xl">emergency</span>
                                </div>
                                <span className="bg-tertiary/10 text-tertiary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                            </div>
                            <h3 className="text-2xl font-bold plus-jakarta-sans mb-4">Critical Blood Bags Fund</h3>
                            <p className="text-on-surface-variant mb-10 leading-relaxed">Purchasing sterile collection kits and storage bags for upcoming city-wide drives.</p>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>PKR Raised</span>
                                    <span className="text-primary">{bloodRaised ? bloodRaised.toLocaleString() : '0'}</span>
                                </div>
                                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${Math.min(((bloodRaised || 0) / 300000) * 100, 100)}%` }}
                                        viewport={{ once: true }}
                                        className="h-full bg-primary"
                                    ></motion.div>
                                </div>
                                <p className="text-xs text-on-surface-variant italic">Target: PKR 300,000</p>
                            </div>
                            <Link
                                to="/donate-blood"
                                className="block text-center w-full mt-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-lg transition-all"
                            >
                                Sponsor Blood Unit
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                            whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)" }}
                            className="glass-card p-10 rounded-3xl shadow-2xl border border-white/60 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className="bg-primary/5 p-4 rounded-2xl">
                                    <span className="material-symbols-outlined text-primary text-4xl">local_shipping</span>
                                </div>
                                <span className="bg-tertiary/10 text-tertiary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                            </div>
                            <h3 className="text-2xl font-bold plus-jakarta-sans mb-4">Thalassemia Kid Care</h3>
                            <p className="text-on-surface-variant mb-10 leading-relaxed">Providing essential iron chelation medicines for children with Thalassemia major.</p>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>PKR Raised</span>
                                    <span className="text-primary">{medRaised ? medRaised.toLocaleString() : '0'}</span>
                                </div>
                                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${Math.min(((medRaised || 0) / 500000) * 100, 100)}%` }}
                                        viewport={{ once: true }}
                                        className="h-full bg-primary"
                                    ></motion.div>
                                </div>
                                <p className="text-xs text-on-surface-variant italic">Target: PKR 500,000</p>
                            </div>
                            <Link
                                to="/medicine-drive"
                                className="block text-center w-full mt-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-lg transition-all"
                            >
                                Donate Medicine
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                            whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                            className="bg-on-primary-fixed text-on-primary-container p-10 rounded-3xl flex flex-col justify-between shadow-lg"
                        >
                            <div>
                                <h3 className="text-2xl font-bold plus-jakarta-sans mb-6">Transparent Handling</h3>
                                <p className="opacity-80 mb-8 leading-relaxed">All financial donations are managed via verified NGO portals. Monthly audits are available for public viewing.</p>
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-center">
                                        <span className="material-symbols-outlined text-primary-container">account_balance</span>
                                        <div>
                                            <p className="text-xs uppercase opacity-60 font-bold tracking-widest">Bank Name</p>
                                            <p className="font-bold">HBL Microfinance</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <span className="material-symbols-outlined text-primary-container">shield_with_heart</span>
                                        <div>
                                            <p className="text-xs uppercase opacity-60 font-bold tracking-widest">Account Number</p>
                                            <p className="font-bold">0323-8723663</p>
                                            <p className="text-xs uppercase opacity-60 font-bold tracking-widest mt-2">Account Title</p>
                                            <p className="font-bold">Abdullah Zafar</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Financial contributions removed per request */}

            {/* Transparency Section */}

            {/* Social Media Section */}
            <section className="py-16 px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-black plus-jakarta-sans mb-4">Connect With Us</h2>
                    <p className="text-lg text-on-surface-variant mb-10">Stay updated with our latest campaigns, events, and community impact stories.</p>
                    <div className="flex flex-wrap justify-center gap-5">
                        <a href="https://www.facebook.com/share/17e4GYR57A/" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-[#1877F2] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-xl transition-all shadow-lg shadow-blue-500/20">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            Facebook
                        </a>
                        <a href="https://www.instagram.com/team_a_b_s_bdsoffical?igsh=MTZhbTFlbjlybWo3Yg==" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-xl transition-all shadow-lg" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            Instagram
                        </a>
                        <a href="https://youtube.com/@team_abs_bds_pakistan?si=JqjLNxjtFAMbKLJs" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-[#FF0000] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-xl transition-all shadow-lg shadow-red-500/20">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            YouTube
                        </a>
                    </div>
                </motion.div>
            </section>

            {/* CTA Banner */}
            <section className="py-20 px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto bg-primary rounded-[3rem] p-12 md:p-24 text-center text-on-primary relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-black plus-jakarta-sans mb-8">Ready to make a difference?</h2>
                        <p className="text-xl opacity-90 mb-12">Register today and receive alerts for critical blood shortages and local donation drives near you.</p>
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center">
                            <input
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="px-8 py-5 rounded-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white w-full sm:max-w-md backdrop-blur-md"
                                placeholder="Enter your email"
                                type="email"
                            />
                            <button type="submit" className="bg-white text-primary px-10 py-5 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all">Join ABS Network</button>
                        </form>
                        {subscribed && <p className="mt-4 font-bold text-green-300">Welcome to the ABS Network! We'll stay in touch.</p>}
                    </div>
                </motion.div>
            </section>


        </div>
    );
};

export default Home;
