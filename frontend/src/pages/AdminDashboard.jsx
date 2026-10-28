import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('donations'); // 'donations' or 'volunteers'

    const [donations, setDonations] = useState([]);
    const [volunteers, setVolunteers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'ABSAdmin2026') {
            setIsAuthenticated(true);
            fetchData();
        } else {
            setError('Incorrect Master Key');
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const resDonations = await fetch(`${API_URL}/api/admin/donations`);
            const dataDonations = await resDonations.json();
            if (dataDonations.success) {
                setDonations(dataDonations.data || []);
            }

            const resVolunteers = await fetch(`${API_URL}/api/admin/volunteers`);
            const dataVolunteers = await resVolunteers.json();
            if (dataVolunteers.success) {
                setVolunteers(dataVolunteers.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- DONATION HANDLERS ---
    const handleVerifyDonation = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/verify-donation/${id}`, { method: 'PATCH' });
            if (res.ok) {
                setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'verified' } : d));
            }
        } catch (err) { console.error(err); }
    };

    const handleRejectDonation = async (id) => {
        if (!window.confirm("Are you sure you want to REJECT this donation? An email will be sent automatically to the donor.")) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/reject-donation/${id}`, { method: 'PATCH' });
            if (res.ok) {
                setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d));
                alert("Rejected! An email has been sent to the user requesting screenshot verification via WhatsApp.");
            }
        } catch (err) { console.error(err); }
    };

    // --- OCR HANDLER ---
    const handleOCRScan = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/ocr-scan/${id}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert('OCR scan initiated! Refresh in a few seconds to see results.');
                setTimeout(fetchData, 5000);
            }
        } catch (err) { console.error(err); }
    };

    // --- VOLUNTEER HANDLERS ---
    const handleVerifyVolunteer = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/verify-volunteer/${id}`, { method: 'PATCH' });
            if (res.ok) {
                setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: 'verified' } : v));
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteVolunteer = async (id) => {
        if (!window.confirm("Are you sure you want to completely delete this volunteer application?")) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/volunteer/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setVolunteers(prev => prev.filter(v => v.id !== id));
            }
        } catch (err) { console.error(err); }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center p-4">
                <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-white/60 shadow-2xl text-center">
                    <span className="material-symbols-outlined text-primary text-5xl mb-4">admin_panel_settings</span>
                    <h2 className="text-2xl font-bold plus-jakarta-sans mb-6">Admin Verification Portal</h2>
                    {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter Master Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-surface-container border-2 focus:border-primary outline-none transition-all"
                            required
                        />
                        <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90">
                            Secure Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface flex flex-col pt-32 pb-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-black plus-jakarta-sans text-on-surface">Foundation Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button onClick={fetchData} className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg font-bold hover:bg-surface-container-highest transition">
                            <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                        </button>
                        <button onClick={() => setIsAuthenticated(false)} className="text-red-600 font-bold hover:underline">Logout</button>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-4 mb-8 border-b-2 border-outline-variant/30 pb-4">
                    <button
                        onClick={() => setActiveTab('donations')}
                        className={`font-black text-lg px-4 py-2 rounded-xl transition ${activeTab === 'donations' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
                    >
                        Financial Donations
                    </button>
                    <button
                        onClick={() => setActiveTab('volunteers')}
                        className={`font-black text-lg px-4 py-2 rounded-xl transition ${activeTab === 'volunteers' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
                    >
                        Volunteer Registry
                    </button>
                </div>

                {loading ? (
                    <p className="text-center font-bold text-xl py-20">Syncing database...</p>
                ) : activeTab === 'donations' ? (
                    /* DONATIONS VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {donations.length === 0 ? <p className="col-span-full text-center py-10 opacity-60">No donations found in database.</p> : null}
                        {donations.map(donation => (
                            <motion.div
                                key={donation.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`glass-card p-6 rounded-2xl shadow-lg border-2 flex flex-col justify-between ${donation.status === 'verified' ? 'border-green-400/50' :
                                    donation.status === 'rejected' ? 'border-red-500/50' : 'border-white/40'
                                    }`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-lg">{donation.donor_name}</p>
                                            <p className="text-sm opacity-70">{donation.donor_email}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="bg-surface-container-high text-xs font-black uppercase px-2 py-1 rounded-md">
                                                {donation.method}
                                            </span>
                                            {donation.status === 'verified' && <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-1 rounded">Verified</span>}
                                            {donation.status === 'rejected' && <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-1 rounded">Rejected</span>}
                                            {(!donation.status || donation.status === 'pending') && <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-2 py-1 rounded">Pending</span>}
                                        </div>
                                    </div>

                                    <div className="bg-surface-container/50 p-4 rounded-xl mb-4 border border-outline/10">
                                        <p className="text-xs uppercase tracking-wider font-bold opacity-60">Claimed Amount</p>
                                        <p className="text-2xl font-black text-primary">PKR {Number(donation.amount).toLocaleString()}</p>
                                        <p className="text-xs uppercase tracking-wider font-bold opacity-60 mt-2">Purpose</p>
                                        <p className="font-bold text-sm text-tertiary">{donation.purpose || 'General Fund'}</p>
                                        <p className="text-xs opacity-50 mt-2 font-mono">{new Date(donation.created_at).toLocaleString()}</p>
                                    </div>

                                    {donation.screenshot_path ? (
                                        <a href={`${API_URL}${donation.screenshot_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-3 rounded-xl font-bold mb-4 text-sm transition-colors border border-blue-200">
                                            <span className="material-symbols-outlined text-[18px]">receipt_long</span> View Receipt
                                        </a>
                                    ) : (
                                        <div className="w-full text-center bg-gray-100 text-gray-400 py-3 rounded-xl font-bold mb-4 text-sm border border-gray-200">
                                            No Screenshot
                                        </div>
                                    )}

                                    {/* OCR Verification Results */}
                                    {donation.screenshot_path && (
                                        <div className={`p-3 rounded-xl mb-4 border text-sm ${donation.ocr_status === 'match' ? 'bg-green-50 border-green-300' :
                                                donation.ocr_status === 'mismatch' ? 'bg-red-50 border-red-300' :
                                                    donation.ocr_status === 'processing' ? 'bg-yellow-50 border-yellow-300' :
                                                        donation.ocr_status === 'error' ? 'bg-gray-50 border-gray-300' :
                                                            'bg-blue-50 border-blue-200'
                                            }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-black text-[10px] uppercase tracking-wider opacity-70">OCR Verification</span>
                                                {donation.ocr_status === 'match' && <span className="bg-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded">AMOUNT MATCH</span>}
                                                {donation.ocr_status === 'mismatch' && <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded">MISMATCH</span>}
                                                {donation.ocr_status === 'processing' && <span className="bg-yellow-600 text-white text-[9px] font-black px-2 py-0.5 rounded">SCANNING...</span>}
                                                {donation.ocr_status === 'no_amount_found' && <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded">NO AMOUNT FOUND</span>}
                                                {donation.ocr_status === 'error' && <span className="bg-gray-500 text-white text-[9px] font-black px-2 py-0.5 rounded">OCR ERROR</span>}
                                                {(!donation.ocr_status || donation.ocr_status === 'pending') && <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded">PENDING</span>}
                                            </div>
                                            {donation.ocr_amount && (
                                                <p className="font-bold mt-1">
                                                    OCR Extracted: <span className={donation.ocr_status === 'match' ? 'text-green-700' : 'text-red-700'}>PKR {Number(donation.ocr_amount).toLocaleString()}</span>
                                                    <span className="opacity-50 ml-1">(vs claimed PKR {Number(donation.amount).toLocaleString()})</span>
                                                </p>
                                            )}
                                            <button
                                                onClick={() => handleOCRScan(donation.id)}
                                                className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">document_scanner</span> Re-scan OCR
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {(!donation.status || donation.status === 'pending') && (
                                    <div className="flex gap-2 mt-4 border-t border-outline-variant/30 pt-4">
                                        <button
                                            onClick={() => handleVerifyDonation(donation.id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:shadow-lg flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">check_circle</span> Approve
                                        </button>
                                        <button
                                            onClick={() => handleRejectDonation(donation.id)}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:shadow-lg flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">cancel</span> Reject & Email
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    /* VOLUNTEERS VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {volunteers.length === 0 ? <p className="col-span-full text-center py-10 opacity-60">No volunteers found in database.</p> : null}
                        {volunteers.map(vol => (
                            <motion.div
                                key={vol.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`glass-card p-6 rounded-2xl shadow-lg border-2 flex flex-col justify-between ${vol.status === 'verified' ? 'border-primary/50' : 'border-white/40'
                                    }`}
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-lg">{vol.name}</p>
                                            <p className="text-xs opacity-70 mb-1">{vol.email}</p>
                                            <a href={`tel:${vol.phone}`} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                                                <span className="material-symbols-outlined text-[14px]">call</span> {vol.phone}
                                            </a>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {vol.blood_group && (
                                                <span className="bg-red-100 text-red-800 text-xs font-black px-2 py-1 rounded-md">
                                                    Blood: {vol.blood_group}
                                                </span>
                                            )}
                                            {vol.status === 'verified' && <span className="bg-primary/20 text-primary text-[10px] font-black uppercase px-2 py-1 rounded">Active</span>}
                                            {(!vol.status || vol.status === 'pending') && <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-2 py-1 rounded">Pending Review</span>}
                                        </div>
                                    </div>

                                    <div className="bg-surface-container/50 p-4 rounded-xl mb-4 border border-outline/10 text-sm">
                                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-60 mb-1">Reason for joining</p>
                                        <p className="italic text-on-surface-variant mb-3">"{vol.reason || 'Not specified'}"</p>
                                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-60 mb-1">Availability</p>
                                        <p className="font-bold">{vol.availability ? String(vol.availability).replace(/[\[\]"{}]/g, '').split(',').join(', ') : 'Flexible'}</p>
                                        <p className="text-xs opacity-40 mt-3 font-mono">{new Date(vol.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 border-t border-outline-variant/30 pt-4">
                                    {(!vol.status || vol.status === 'pending') && (
                                        <button
                                            onClick={() => handleVerifyVolunteer(vol.id)}
                                            className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:shadow-lg flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">check_circle</span> Verify
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteVolunteer(vol.id)}
                                        className="flex-1 bg-surface-container-high hover:bg-red-100 hover:text-red-700 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:shadow-lg flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span> Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
