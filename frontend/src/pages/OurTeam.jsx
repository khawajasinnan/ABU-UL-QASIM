import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const teamMembers = [
    {
        name: 'Malik Abdullah Zafar',
        designation: 'Founder & President',
        image: '/Malik-Abdullah.png',
        description: `Abu-ul-Qasim Blood Donor Society is a non-profit organization whose founder and president is Malik Abdullah Zafar, who has been leading this entire project from the beginning. He is an entrepreneur and has a background in IT. Malik Abdullah was a young boy when he started at a young age, founding the society in 2017. From 2017 to 2020, this society was in the Sargodha division, after which it started working in many cities of Punjab. Currently, Abu-ul-Qasim Blood Society is working in 11 cities of Pakistan, in which it organizes blood donation, blood awareness, awareness of thalassemia, and blood camps for children affected by thalassemia.`
    },
    {
        name: 'Abdullah Murtaza Haral',
        designation: 'Vice President',
        image: '/team-avatar.png',
        description: `Abdullah Murtaza Haral serves as the Vice President of Abu-ul-Qasim Blood Donor Society, supporting the president in all operational and strategic aspects. He plays a pivotal role in coordinating blood donation drives across multiple cities and ensures that the organization's mission reaches every corner of the community. His dedication to volunteerism and organizational management has been instrumental in expanding the society's outreach.`
    },
    {
        name: 'Abdullah Bin Akram',
        designation: 'Special Assistant Speaker',
        image: '/team-avatar.png',
        description: `Abdullah Bin Akram holds the key position of Special Assistant Speaker, representing the society at public events, seminars, and awareness campaigns. He is the voice of the organization, articulating its mission and values to communities, media, and partner organizations. His communication skills and public speaking ability have greatly increased the visibility of the society's humanitarian work across Pakistan.`
    },
    {
        name: 'Abdullah Murtaza',
        designation: 'Special Assistant',
        image: '/team-avatar.png',
        description: `Abdullah Murtaza serves as a Special Assistant, providing critical support to the leadership in managing day-to-day organizational activities. He assists in planning events, coordinating with volunteers, and ensuring seamless execution of blood donation camps. His tireless work behind the scenes ensures that every operation runs smoothly and every patient receives help in time.`
    },
    {
        name: 'Mateen Hashim Shah',
        designation: 'Vice President — Sargodha',
        image: '/team-avatar.png',
        description: `Mateen Hashim Shah leads operations in the Sargodha region as Vice President for the division. He oversees blood donation camps, volunteer coordination, and thalassemia awareness drives specifically within Sargodha and its surrounding areas. His local knowledge and strong community ties have made him an invaluable figure in the society's core region of operations.`
    },
    {
        name: 'Sohail Akram',
        designation: 'Finance Secretary',
        image: '/team-avatar.png',
        description: `Sohail Akram manages the financial operations of Abu-ul-Qasim Blood Donor Society as Finance Secretary. He oversees all monetary transactions, donation tracking, and budget allocation for campaigns and medical supplies. His transparency and meticulous record-keeping ensure that every donated rupee is accounted for and directed towards saving lives.`
    },
    {
        name: 'Abu Bakar Akhtar',
        designation: 'Youth In-charge',
        image: '/team-avatar.png',
        description: `Abu Bakar Akhtar is the Youth In-charge, responsible for engaging young people in the society's humanitarian mission. He recruits and mentors young volunteers, organizes university-level awareness campaigns, and leads youth-driven blood donation drives. His energy and commitment to empowering the next generation of donors is a vital part of the society's growth strategy.`
    },
    {
        name: 'Sajad Akram',
        designation: 'In-charge — Print Media',
        image: '/team-avatar.png',
        description: `Sajad Akram manages all print media and publicity efforts for the organization. He handles the creation and distribution of brochures, pamphlets, banners, and newspaper coverage for blood donation events. His work in print media ensures that the society's message reaches communities that may not be connected through digital platforms.`
    },
    {
        name: 'Muhammad Amjad (PBBA)',
        designation: 'JYM In-charge',
        image: '/team-avatar.png',
        description: `Muhammad Amjad, affiliated with PBBA, serves as the JYM In-charge for the society. He leads joint youth mobilization efforts, bringing together various student and community groups for large-scale blood donation campaigns. His ability to mobilize diverse groups under a single humanitarian cause has resulted in some of the society's most successful donation drives.`
    },
    {
        name: 'Rehan Yousaf & Malik Hamza',
        designation: 'Case Controller & Camps In-charge',
        image: '/team-avatar.png',
        description: `Rehan Yousaf and Malik Hamza jointly manage emergency case coordination and blood donation camp logistics. Rehan handles incoming blood requests and matches donors with patients in critical need, while Malik Hamza oversees the setup, management, and execution of donation camps across multiple cities. Together, they form the operational backbone of the society's emergency response system.`
    },
    {
        name: 'Dilawar Shaheen, Tahir Islam Kambo & Shahroz Hassan',
        designation: 'Social Activities In-charge & Camp Management',
        image: '/team-avatar.png',
        description: `This dynamic trio manages all social activities and camp management for the society. Dilawar Shaheen coordinates community engagement events, Tahir Islam Kambo handles logistical planning for camps, and Shahroz Hassan oversees on-ground camp management. Their combined efforts ensure that every blood donation camp runs efficiently, every volunteer is well-coordinated, and every community event leaves a lasting positive impact.`
    },
    {
        name: 'Daniyal Murtaza, Malik Arslan, Saqib Younas & Sheikh Ayaz',
        designation: 'Senior Members — Camping In-charge',
        image: '/team-avatar.png',
        description: `As senior members and Camping In-charges, this group brings years of experience and dedication to organizing large-scale blood donation camps. Daniyal Murtaza manages volunteer assignments, Malik Arslan handles donor logistics, Saqib Younas coordinates medical staff and equipment, and Sheikh Ayaz ensures post-camp follow-ups and donor care. Their seniority and expertise are crucial to maintaining the high standards the society is known for.`
    }
];

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const OurTeam = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleMember = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden">
            {/* Hero */}
            <section className="relative bg-zinc-950 text-white py-24 px-8 overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto text-center relative z-10"
                >
                    <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">Board of Directors</span>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black plus-jakarta-sans mb-4 md:mb-6 tracking-tight">Our <span className="text-primary">Leadership</span></h1>
                    <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Meet the dedicated visionaries shaping the Abu-ul-Qasim Blood Donor Society. Every life saved is a testament to their tireless strategy and commitment.
                    </p>
                </motion.div>
            </section>

            <section className="max-w-6xl mx-auto px-4 md:px-8 relative -top-12 z-20">
                {/* President Section (Featured) */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="bg-white rounded-[2rem] border border-zinc-200 p-6 md:p-12 mb-16 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                        <div className="flex flex-col items-center flex-shrink-0">
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                src="/Malik-Abdullah.png"
                                alt="Malik Abdullah Zafar"
                                className="w-48 h-48 rounded-[1.5rem] object-cover shadow-xl grayscale hover:grayscale-0 transition-all duration-500 border border-zinc-100"
                            />
                            <span className="mt-4 bg-zinc-900 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-md">Founder & President</span>
                        </div>
                        <div className="pt-2">
                            <h2 className="text-3xl md:text-4xl font-black plus-jakarta-sans text-zinc-900 mb-4 md:mb-6">Malik Abdullah Zafar</h2>
                            <p className="text-zinc-600 leading-relaxed text-base md:text-lg text-justify md:text-left">
                                {teamMembers[0].description}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Team Members Grid */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black plus-jakarta-sans text-zinc-900 mb-4 tracking-tight">Executive Board</h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto">The strategic minds and operational experts driving our humanitarian objectives across the nation.</p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24"
                >
                    {teamMembers.slice(1).map((member, idx) => {
                        const actualIndex = idx + 1;
                        const isOpen = openIndex === actualIndex;
                        return (
                            <motion.div
                                variants={itemVariants}
                                key={actualIndex}
                                className={`bg-white rounded-2xl border transition-all duration-500 overflow-hidden ${isOpen ? 'border-primary/30 shadow-[0_20px_40px_rgba(0,0,0,0.06)]' : 'border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300'}`}
                            >
                                <button
                                    onClick={() => toggleMember(actualIndex)}
                                    className="w-full text-left p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 focus:outline-none relative"
                                >
                                    {/* Profile Picture */}
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-200 self-start bg-zinc-100">
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 pb-1 w-full">
                                        <h3 className="text-xl font-bold text-zinc-900 plus-jakarta-sans truncate pr-8">{member.name}</h3>
                                        <p className="text-sm text-primary font-bold mt-1 tracking-wide">{member.designation}</p>
                                    </div>
                                    <span className={`absolute right-6 top-8 material-symbols-outlined text-2xl text-zinc-300 transition-transform duration-500 bg-zinc-50 rounded-full p-2 ${isOpen ? 'rotate-180 bg-primary/10 text-primary' : 'hover:bg-zinc-100'}`}>
                                        expand_more
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="px-6 md:px-8 overflow-hidden"
                                        >
                                            <div className="border-t border-zinc-100 py-6">
                                                <p className="text-zinc-600 leading-relaxed">{member.description}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* Join CTA */}
            <section className="bg-primary py-24 px-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative z-10"
                >
                    <h2 className="text-4xl md:text-5xl font-black plus-jakarta-sans mb-6">Inspired to Lead?</h2>
                    <p className="text-red-100 text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                        We are always looking for passionate individuals who want to make a systemic difference. Join our network of life-savers.
                    </p>
                    <a href="/volunteer" className="inline-block bg-white text-primary px-10 py-4 rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        Become a Volunteer
                    </a>
                </motion.div>
            </section>
        </div>
    );
};

export default OurTeam;
