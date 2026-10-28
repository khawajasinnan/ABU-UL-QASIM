import React from 'react';

const HelpChild = () => {
    return (
        <div className="animate-in fade-in py-12 md:py-16 max-w-7xl mx-auto px-4 md:px-8">
            <section className="relative min-h-[500px] md:min-h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden flex items-center mb-12 md:mb-16">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmYQ8x7Qp3wE8v83_O8wU98vI1I6S4Kz012Z6K9s_KzY6V0lMvW14mO05_0zYQvD_F2Q88K3W2uXqP6w9l0R_1F_zDlkI7HwP1qM_9X905S6N0x0h5c5nQ" alt="Happy child" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
                <div className="relative z-10 p-8 sm:p-12 md:p-24 max-w-2xl text-white">
                    <span className="text-primary font-bold tracking-widest text-xs md:text-sm uppercase mb-4 block">Child Sponsorship Program</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold font-headline mb-4 md:mb-6 leading-tight">Adopt a <span className="text-primary italic">Smile.</span></h1>
                    <p className="text-base md:text-lg text-white/90 mb-8 md:mb-10 leading-relaxed">
                        Many families from underprivileged backgrounds cannot afford the lifelong treatment of Thalassemia. By sponsoring a child, you take full financial responsibility for their medical care, allowing them to live a normal, happy life.
                    </p>
                    <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(175,16,26,0.5)] transition-all">
                        Start Sponsorship
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black font-headline mb-6">What does Sponsorship Cover?</h2>
                    <ul className="space-y-6">
                        {[
                            { icon: 'water_drop', title: 'Monthly Blood Transfusions', desc: 'Covering the cost of screening and cross-matching.' },
                            { icon: 'medication', title: 'Iron Chelation Therapy', desc: 'Desferal injections and oral medicines to prevent organ failure.' },
                            { icon: 'clinical_notes', title: 'Quarterly Lab Tests', desc: 'CBC, Serum Ferritin, and LFTs/RFTs.' },
                            { icon: 'psychology', title: 'Family Counseling', desc: 'Emotional support for the child and parents.' }
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4">
                                <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{item.title}</h4>
                                    <p className="text-on-surface-variant text-sm">{item.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="glass-card p-6 sm:p-8 md:p-12 rounded-3xl shadow-2xl border border-white/60 relative overflow-hidden">
                    <h3 className="text-2xl font-bold font-headline mb-6">Sponsor Request Form</h3>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Sponsor request submitted!'); }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-on-surface uppercase mb-2">Name</label>
                                <input required className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary" type="text" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface uppercase mb-2">Email</label>
                                <input required className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary" type="email" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-on-surface uppercase mb-2">Sponsorship Tier</label>
                            <select className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary">
                                <option>Full Support (Rs. 25,000 / month)</option>
                                <option>Medical Support only (Rs. 15,000 / month)</option>
                                <option>Transfusion Support only (Rs. 10,000 / month)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-on-surface uppercase mb-2">Payment Frequency</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="freq" defaultChecked className="text-primary focus:ring-primary" /> Monthly
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="freq" className="text-primary focus:ring-primary" /> Annually
                                </label>
                            </div>
                        </div>
                        <button className="w-full py-4 mt-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all">Submit Pledge</button>
                    </form>
                    <p className="text-xs text-center text-on-surface-variant mt-4">By pledging, you commit to recurring support. You will receive patient progress reports bi-annually.</p>
                </div>
            </div>
        </div>
    );
};

export default HelpChild;
