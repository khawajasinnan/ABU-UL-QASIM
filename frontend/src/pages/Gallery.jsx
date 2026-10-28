import React from 'react';
import { motion } from 'framer-motion';
import QuoteCarousel from '../components/QuoteCarousel';
import ImageCarousel from '../components/ImageCarousel';
import donationCampTeam from '../assets/Donation-CampTeam.jpg';
import eidOrphanageProject from '../assets/Eid-Orphanage-Project.png';
import medicineDriveImage from '../assets/Mediciene-Drive.jpg';
import donationCamp from '../assets/Donation-Camp.png';
import volunteers from '../assets/Volunteers.png';
import pastedImage from '../assets/Pasted image.png';
import screenshotImage from '../assets/Screenshot_20260413-211441.png';
import malikAbdullah from '../assets/Malik-Abdullah.png';
import desferalImage from '../assets/Desferal.svg';
import arfedImage from '../assets/Arfed.svg';

const galleryItems = [
    {
        id: 1,
        title: 'Donation Camp Team',
        image: donationCampTeam,
        category: 'Blood Drives',
        span: 'col-span-1 md:col-span-2 row-span-2'
    },
    {
        id: 2,
        title: 'Eid Orphanage Project',
        image: eidOrphanageProject,
        category: 'Social Welfare',
        span: 'col-span-1 row-span-1'
    },
    {
        id: 3,
        title: 'Thalassemia Medicine Drive',
        image: medicineDriveImage,
        category: 'Medical Support',
        span: 'col-span-1 row-span-1'
    },
    {
        id: 4,
        title: 'Free Blood Screenings',
        image: donationCamp,
        category: 'Health Camps',
        span: 'col-span-1 md:col-span-2 row-span-1'
    },
    {
        id: 5,
        title: 'Volunteer Outreach',
        image: volunteers,
        category: 'Community Support',
        span: 'col-span-1 row-span-1'
    },
    {
        id: 6,
        title: 'Desferal Medication Support',
        image: desferalImage,
        category: 'Medical Support',
        span: 'col-span-1 row-span-1'
    },
    {
        id: 7,
        title: 'Arfed Medication Support',
        image: arfedImage,
        category: 'Medical Support',
        span: 'col-span-1 row-span-1'
    },
    {
        id: 8,
        title: 'Child Care & Sponsorship',
        image: malikAbdullah,
        category: 'Health & Care',
        span: 'col-span-1 row-span-1'
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100 }
    }
};

const Gallery = () => {
    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Gallery Header */}
            <section className="bg-zinc-950 text-white py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">Our Ground Impact</span>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black plus-jakarta-sans mb-4 md:mb-6 tracking-tight">Our <span className="text-primary">Gallery</span> & Camps</h1>
                    <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        A visual journey of our humanitarian efforts, from city-wide blood donation camps to distributing smiles on Eid.
                    </p>
                </div>
            </section>

            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <span className="text-primary font-bold uppercase text-sm tracking-widest">Featured Gallery</span>
                            <h2 className="text-3xl md:text-4xl font-black plus-jakarta-sans mt-3">Top Images from Our Medicine Drives</h2>
                        </div>
                        <p className="max-w-2xl text-zinc-600">A curated set of 8 photos highlighting blood camps, medicines, and the Desferal / Arfed support efforts.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {galleryItems.map((item) => (
                            <div key={item.id} className={`overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-lg ${item.span}`}>
                                <img src={item.image} alt={item.title} className="h-64 w-full object-cover transition duration-500 hover:scale-105" />
                                <div className="p-5">
                                    <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">{item.category}</p>
                                    <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Per-category carousels */}
            <section className="relative -top-12 z-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    {[
                        {
                            id: 'blood-camps',
                            title: 'Blood Donation Camps',
                            images: [
                                { src: donationCamp, caption: 'Community Donation Camp' },
                                { src: donationCampTeam, caption: 'Donation Camp Team' },
                                { src: volunteers, caption: 'Volunteers in Action' }
                            ]
                        },
                        {
                            id: 'eid-orphanage',
                            title: 'Eid Orphanage Projects',
                            images: [
                                { src: eidOrphanageProject, caption: 'Eid Gift Distribution' },
                                { src: pastedImage, caption: 'Community Outreach' },
                                { src: screenshotImage, caption: 'Eid Event Highlights' }
                            ]
                        },
                        {
                            id: 'thalassemia',
                            title: 'Thalassemia Awareness & Medicine Drives',
                            images: [
                                { src: medicineDriveImage, caption: 'Medicine & Awareness Drive' },
                                { src: desferalImage, caption: 'Desferal Medication Support' },
                                { src: arfedImage, caption: 'Arfed Medication Support' }
                            ]
                        },
                        {
                            id: 'ration-drives',
                            title: 'Ration Drives & Relief',
                            images: [
                                { src: donationCampTeam, caption: 'Ration Packing Team' },
                                { src: donationCamp, caption: 'Distribution Point' }
                            ]
                        },
                        {
                            id: 'orphan-home',
                            title: 'Orphan Home Visits',
                            images: [
                                { src: eidOrphanageProject, caption: 'Orphan Home Visit' },
                                { src: volunteers, caption: 'Donor Volunteers' }
                            ]
                        }
                    ].map((section, i) => (
                        <motion.section key={section.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="py-12">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl md:text-3xl font-bold plus-jakarta-sans">{section.title}</h3>
                                <div className="text-sm text-on-surface-variant flex items-center gap-4">
                                    <span>{section.images.length} images</span>
                                </div>
                            </div>

                            <div className="card-interactive p-4">
                                <ImageCarousel images={section.images} heightClass="h-56 md:h-72 lg:h-96" />
                            </div>
                        </motion.section>
                    ))}
                </div>
            </section>

            {/* Quote carousel to add warmth and testimonials */}
            <section className="py-16 px-6 bg-surface-container-low">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold plus-jakarta-sans mb-4">Stories from the Field</h2>
                    <p className="text-on-surface-variant mb-8">Short testimonials from our volunteers and donors.</p>
                    <QuoteCarousel />
                </div>
            </section>

            {/* Video, social feed removed per request */}
        </div>
    );
};
 

export default Gallery;
