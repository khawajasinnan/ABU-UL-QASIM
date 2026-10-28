import React, { useState } from 'react';
import { motion } from 'framer-motion';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DonateBlood = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cnic: '',
        bloodGroup: 'A+',
        location: 'Main City Hospital - Donor Wing',
        date: '',
        slot: '09:00 AM',
        dob: ''
    });
    const [ageError, setAgeError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'dob') {
            setAgeError('');
        }
    };

    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitResult(null);

        // 18+ age validation
        if (!formData.dob) {
            setAgeError('Please enter your date of birth.');
            return;
        }

        const age = calculateAge(formData.dob);
        if (age < 18) {
            setAgeError(`You must be at least 18 years old to donate blood. Your current age is ${age}.`);
            return;
        }

        setAgeError('');
        setSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/api/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    cnic: formData.cnic,
                    bloodGroup: formData.bloodGroup,
                    location: formData.location,
                    date: formData.date,
                    slot: formData.slot,
                    dob: formData.dob
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSubmitResult({ type: 'success', message: 'Appointment Booked! A confirmation email has been sent to you.' });
                setFormData({ name: '', email: '', phone: '', cnic: '', bloodGroup: 'A+', location: 'DHQ Teaching Hospital Sargodha', date: '', slot: '09:00 AM', dob: '' });
            } else {
                setSubmitResult({ type: 'error', message: data.error || 'Something went wrong.' });
            }
        } catch {
            setSubmitResult({ type: 'error', message: 'Network error. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in py-12 md:py-16 max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                <h1 className="text-4xl md:text-5xl font-black font-headline mb-4">Give the Gift of <span className="text-primary italic">Life</span></h1>
                <p className="text-on-surface-variant text-base md:text-lg">One donation can save up to three lives. Book a slot today to save lives in your community.</p>
            </div>

            <div className="max-w-3xl mx-auto">
                {/* Appointment Scheduling */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card border border-white/60 shadow-2xl rounded-3xl p-6 md:p-10 relative overflow-hidden"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-primary text-3xl">calendar_month</span>
                        <h2 className="text-2xl font-bold font-headline">Book an Appointment</h2>
                    </div>
                    <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                        Schedule your appointment at our nearest center. Must be 18+ to donate. Most donations take less than 45 minutes.
                    </p>

                    {/* Success/Error Message */}
                    {submitResult && (
                        <div className={`p-4 rounded-xl mb-6 ${submitResult.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                            <p className="font-bold text-sm">{submitResult.message}</p>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/50 rounded-xl">
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Full Name</label>
                                <input required type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold" />
                            </div>
                            <div className="p-4 bg-white/50 rounded-xl">
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Email</label>
                                <input required type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/50 rounded-xl">
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Phone</label>
                                <input required type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/50 rounded-xl">
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">CNIC</label>
                                <input required type="text" placeholder="xxxxx-xxxxxxx-x" value={formData.cnic} onChange={(e) => handleChange('cnic', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold" />
                            </div>
                            <div className="p-4 bg-white/50 rounded-xl">
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Blood Group</label>
                                <select required value={formData.bloodGroup} onChange={(e) => handleChange('bloodGroup', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold uppercase">
                                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                                    <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                                </select>
                            </div>
                        </div>

                        {/* Date of Birth - 18+ Validation */}
                        <div className="p-4 bg-white/50 rounded-xl">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">
                                Date of Birth <span className="text-primary">(Must be 18+)</span>
                            </label>
                            <input
                                required
                                type="date"
                                value={formData.dob}
                                onChange={(e) => handleChange('dob', e.target.value)}
                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold"
                                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                            />
                            {ageError && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">error</span>
                                        {ageError}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Location</label>
                            <select value={formData.location} onChange={(e) => handleChange('location', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-on-surface">
                                <option>DHQ Teaching Hospital Sargodha</option>
                                <option>CMH Sargodha</option>
                                <option>MTH (Sargodha Medical College) Hospital</option>
                                <option>Munir Hospital Sargodha</option>
                                <option>Banto Zindagi Hub (Muqam-e-Hayyat)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-surface-container-high rounded-xl">
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Date</label>
                                <input required type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold" />
                            </div>
                            <div className="p-4 bg-white/50 rounded-xl">
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2">Time Slot</label>
                                <select value={formData.slot} onChange={(e) => handleChange('slot', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold">
                                    <option>09:00 AM</option>
                                    <option>11:30 AM</option>
                                    <option>02:15 PM</option>
                                </select>
                            </div>
                        </div>
                        <button
                            disabled={submitting}
                            className={`w-full py-4 mt-4 bg-primary-container text-white font-bold rounded-full hover:bg-primary transition-all ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Booking...' : 'Confirm Appointment'}
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Blood Urgency Board Section */}
            <div className="mt-20">
                <h2 className="text-3xl font-bold font-headline mb-6 text-center">Live Blood Group Urgency Board</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg, idx) => {
                        const urgency = idx % 3 === 0 ? 'bg-error text-white' : (idx % 2 === 0 ? 'bg-secondary text-white' : 'bg-tertiary text-white');
                        const status = idx % 3 === 0 ? 'Critical' : (idx % 2 === 0 ? 'Needed' : 'Sufficient');

                        return (
                            <div key={bg} className={`p-6 rounded-2xl flex flex-col items-center justify-center ${urgency} shadow-lg pointer-events-none`}>
                                <span className="text-3xl font-black">{bg}</span>
                                <span className="text-xs uppercase tracking-widest font-bold mt-2 opacity-90">{status}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div >
    );
};

export default DonateBlood;
