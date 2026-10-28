import React, { useState } from 'react';

const PatientTracker = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const mockedPatients = [
        { id: 'VP-1024', name: 'Ayesha K.', age: 8, bg: 'O-', frequency: 'Every 14 days', raised: 45000, pending: 15000, disease: 'Thalassemia Major' },
        { id: 'VP-1025', name: 'Zohaib R.', age: 12, bg: 'B+', frequency: 'Every 21 days', raised: 20000, pending: 40000, disease: 'Thalassemia Major' },
        { id: 'VP-1026', name: 'Fatima S.', age: 5, bg: 'A+', frequency: 'Every 15 days', raised: 10000, pending: 50000, disease: 'Thalassemia Intermedia' }
    ];

    const filtered = mockedPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="animate-in fade-in py-12 md:py-16 max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <h1 className="text-4xl md:text-5xl font-black font-headline mb-4">Patient <span className="text-primary italic">Tracker</span></h1>
                <p className="text-on-surface-variant text-base md:text-lg">
                    Follow the journey of our warriors. Sponsor their life-saving transfusions and iron chelation therapy.
                </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-16 relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Patient ID or Name..."
                    className="w-full bg-surface-container-high border-none rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary shadow-sm text-lg"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filtered.map(patient => {
                    const percentComplete = (patient.raised / (patient.raised + patient.pending)) * 100;
                    return (
                        <div key={patient.id} className="glass-card border border-white/60 rounded-3xl p-6 md:p-8 shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-8xl text-primary">healing</span>
                            </div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold font-headline">{patient.name}</h3>
                                    <span className="text-sm font-bold text-on-surface-variant">{patient.id} • {patient.age} years old</span>
                                </div>
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-black text-sm">{patient.bg}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Diagnosis:</span>
                                    <span className="font-bold">{patient.disease}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">Transfusion Needs:</span>
                                    <span className="font-bold">{patient.frequency}</span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span>Rs. {patient.raised.toLocaleString()} Raised</span>
                                    <span className="text-primary">{Math.round(percentComplete)}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden mb-2">
                                    <div className="h-full bg-primary" style={{ width: `${percentComplete}%` }}></div>
                                </div>
                                <p className="text-xs text-right text-on-surface-variant">Goal: Rs. {(patient.raised + patient.pending).toLocaleString()} for annual care</p>
                            </div>

                            <button className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl hover:bg-primary hover:text-white transition-all">
                                Pledge Support
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PatientTracker;
