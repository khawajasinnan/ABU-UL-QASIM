import React from 'react';
import { motion } from 'framer-motion';


const About = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-zinc-950 text-white py-24 px-8 overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">Who we are</span>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl lg:text-7xl font-black plus-jakarta-sans mb-6 tracking-tight"
                    >
                        About <span className="text-primary">ABU-UL-QASIM</span> Foundation
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed"
                    >
                        A charitable, non-profit, and Non-Governmental Organization working for humanity across Pakistan since 2017.
                    </motion.p>
                </div>
            </section>

            {/* Main About Content */}
            <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg border border-zinc-100 p-8 md:p-12 mb-12"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <img src="/logo-abs-new.png" alt="ABS Logo" className="h-16 w-16 rounded-full object-cover shadow-md" />
                        <div>
                            <h2 className="text-2xl font-black plus-jakarta-sans text-zinc-900">(ABS) Abu ul Qasim Foundation Pakistan</h2>
                            <p className="text-zinc-500 text-sm">Established in 2017</p>
                        </div>
                    </div>
                    <p className="text-zinc-700 leading-relaxed text-lg mb-6">
                        (ABS) Abu ul Qasim Foundation Pakistan is a charitable, non-profit, and Non-Governmental Organization in Pakistan. Abu ul Qasim blood society Organization was established in 2017
                    </p>
                    <p className="text-zinc-700 leading-relaxed text-lg mb-6">
                        ABU-UL-QASIM Blood Donor Society is a non-profit blood donation society, in Pakistan. Abu-ul-Qasim Blood Donor Society is working for humanity in different area of Pakistan. It brings together blood donors & patients needing blood. We are here to share our efforts and passion with you and to motivate people to help humans. It works for humanitarian purposes by connecting blood donors with patients in need.
                    </p>
                </motion.div>

                {/* About Society */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={containerVariants}
                    className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-8 md:p-12 mb-12"
                >
                    <motion.h2 variants={itemVariants} className="text-3xl font-black plus-jakarta-sans text-red-800 mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-red-600">diversity_3</span>
                        About Society
                    </motion.h2>
                    <ul className="space-y-6">
                        <motion.li variants={itemVariants} className="flex items-start gap-4">
                            <span className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <p className="text-zinc-700 leading-relaxed text-lg">It is a volunteer-based organization focused on saving lives through blood donations.</p>
                        </motion.li>
                        <motion.li variants={itemVariants} className="flex items-start gap-4">
                            <span className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <p className="text-zinc-700 leading-relaxed text-lg">We organize blood donation campaigns and awareness campaigns.</p>
                        </motion.li>
                        <motion.li variants={itemVariants} className="flex items-start gap-4">
                            <span className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <p className="text-zinc-700 leading-relaxed text-lg">ABS Pakistan deals with emergency cases every single day. They also run blood donation drives for kids affected by thalassemia. Every year, they provide over 30,000 blood bags to these children and arrange donations from about 8 to 10 donors daily.</p>
                        </motion.li>
                        <motion.li variants={itemVariants} className="flex items-start gap-4">
                            <span className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <p className="text-zinc-700 leading-relaxed text-lg">On a daily basis, we receive 30 to 40 cases from each city and on a daily basis, we get 20 to 25 donor blood transfusions.</p>
                        </motion.li>
                    </ul>
                </motion.div>

                {/* Founder Introduction */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 60 }}
                    className="bg-white rounded-2xl shadow-lg border border-zinc-100 p-8 md:p-12 mb-12"
                >
                    <h2 className="text-3xl font-black plus-jakarta-sans text-zinc-900 mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-yellow-600">person</span>
                        Founder Introduction
                    </h2>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <img src="/Malik-Abdullah.png" alt="Malik Abdullah Zafar" className="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-red-100 flex-shrink-0" />
                        <div>
                            <h3 className="text-xl font-bold text-red-800 mb-2">Malik Abdullah Zafar</h3>
                            <p className="text-sm text-zinc-500 mb-4 font-bold uppercase tracking-wider">Founder & President</p>
                            <p className="text-zinc-700 leading-relaxed text-lg">
                                Abu ul Qasim Blood Donor Society is a non-profit started in 2017 by Malik Abdullah Zafar, who began this journey at a young age with a simple goal — to help save lives through blood donation. With a background in IT and a passion for helping others, he turned a small effort in the Sargodha division into a growing network. Today, the society is working in 11 cities across Pakistan. They organize thalassemia drives, raise awareness about blood donation and thalassemia, and regularly arrange blood camps for children fighting thalassemia — turning one person's vision into hope for many.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Projects */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 md:p-12 mb-12 text-white"
                >
                    <motion.h2 variants={itemVariants} className="text-3xl font-black plus-jakarta-sans mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-red-400">volunteer_activism</span>
                        Our Projects
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: '🩸', title: 'Urgent Donor Matching', desc: 'Rapidly connect patients with compatible donors for emergency cases.' },
                            { icon: '🏕️', title: 'Donation Drives & Camps', desc: 'City-wide camps with safe collection protocols.' },
                            { icon: '💊', title: 'Thalassemia Support', desc: 'Medicine drives and regular support for children with thalassemia.' },
                            { icon: '🤝', title: 'Volunteer Network', desc: 'Build and train a trusted network of volunteers across cities.' },
                            { icon: '📢', title: 'Awareness Campaigns', desc: 'School and community outreach programs on blood donation and thalassemia.' },
                            { icon: '📦', title: 'Ration & Relief Drives', desc: 'Distribute essentials during crises and festive seasons.' },
                            { icon: '💻', title: 'Skill & IT Training', desc: 'Free short courses to empower youth for employment.' },
                            { icon: '🏥', title: 'Medical Camps', desc: 'Free check-ups, blood group screening and first-aid training.' },
                            { icon: '🏠', title: 'Orphan Home Visits', desc: 'Support and events for orphan homes and shelters.' }
                        ].map((project, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.06 }} className="bg-white/6 backdrop-blur-sm rounded-2xl p-6 hover:scale-105 transform transition-all shadow-md">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center text-red-600 text-xl font-bold">{project.icon}</div>
                                    <div>
                                        <div className="font-bold text-md text-white">{project.title}</div>
                                        <p className="text-sm text-red-100/90 mt-1 leading-relaxed">{project.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 md:p-12 text-center text-white">
                    <p className="text-2xl font-bold plus-jakarta-sans mb-4 leading-relaxed">
                        Peace be upon you and mercy be upon you ☪️
                    </p>
                    <p className="text-lg text-red-100 max-w-3xl mx-auto leading-relaxed mb-8">
                        You too can now be part of the team (ABS) in the struggle to make Pakistan better by doing small things for your beloved country Pakistan for the betterment of your next generation. Come and prove that humanity is alive in you.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a href="/donate-blood" className="bg-white text-red-700 px-8 py-3 rounded-full font-bold hover:bg-red-50 transition-colors shadow-lg">🩸 Donate Blood</a>
                        <a href="/volunteer" className="bg-red-800 text-white px-8 py-3 rounded-full font-bold hover:bg-red-900 transition-colors shadow-lg border border-red-500">🤝 Become a Volunteer</a>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="bg-zinc-50 py-16 px-8 border-t border-zinc-200">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-black plus-jakarta-sans text-zinc-900 mb-8 text-center">Get in Touch</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a href="tel:03238723663" className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-zinc-100">
                            <span className="material-symbols-outlined text-4xl text-red-600 mb-3">call</span>
                            <p className="font-bold text-zinc-900">0323-8723663</p>
                            <p className="text-zinc-500 text-sm">Phone / WhatsApp</p>
                        </a>
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=bantozindagi0981@gmail.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-zinc-100">
                            <span className="material-symbols-outlined text-4xl text-red-600 mb-3">mail</span>
                            <p className="font-bold text-zinc-900">bantozindagi0981@gmail.com</p>
                            <p className="text-zinc-500 text-sm">Email</p>
                        </a>
                        <a href="https://www.google.com/maps/search/?api=1&query=Muqam+e+hayyat+road+Sargodha+Pakistan+40100" target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow border border-zinc-100">
                            <span className="material-symbols-outlined text-4xl text-red-600 mb-3">location_on</span>
                            <p className="font-bold text-zinc-900">Muqam e hayyat road</p>
                            <p className="text-zinc-500 text-sm">Sargodha, Pakistan 40100</p>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
