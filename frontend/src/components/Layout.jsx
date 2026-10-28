import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const loadingStartRef = React.useRef(0);
    const loadingTimerRef = React.useRef(null);
    const MIN_LOADING_MS = 2500; // show spinner at least 2.5s

    useEffect(() => {
        // When route changes, ensure spinner shows for a minimum duration
        const elapsed = Date.now() - (loadingStartRef.current || 0);
        if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
            loadingTimerRef.current = null;
        }
        if (elapsed < MIN_LOADING_MS) {
            loadingTimerRef.current = setTimeout(() => setIsLoading(false), MIN_LOADING_MS - elapsed);
        } else {
            setIsLoading(false);
        }

        return () => {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
            }
        };
    }, [location]);

    // Lock body scroll while the fullscreen loader is visible
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isLoading]);

    useEffect(() => {
        // Show spinner for full page reloads and for link clicks that navigate away
        const onBeforeUnload = () => {
            loadingStartRef.current = Date.now();
            setIsLoading(true);
        };
        const onDocClick = (e) => {
            const anchor = e.target.closest && e.target.closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            const target = anchor.getAttribute('target');
            // Only show spinner for internal navigation (no _blank) and real hrefs
            if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && target !== '_blank') {
                loadingStartRef.current = Date.now();
                setIsLoading(true);
            }
        };
        document.addEventListener('click', onDocClick);
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            document.removeEventListener('click', onDocClick);
            window.removeEventListener('beforeunload', onBeforeUnload);
        };
    }, []);

    return (
        <>
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-sm shadow-[0_20px_40px_rgba(175,16,26,0.05)]">
                <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto w-full relative">
                    {/* Left: Abu-ul-Qasim Logo + Foundation Name */}
                    <Link to="/" className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                        <img src="/logo-abs-new.png" alt="Abu-ul-Qasim Blood Donor Society" className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover transition-transform duration-300 hover:scale-105 hover:opacity-95" />
                        <span className="text-sm md:text-lg font-black text-red-800 plus-jakarta-sans tracking-tight leading-tight hidden sm:inline">ABU-UL-QASIM<br /><span className="text-xs md:text-sm font-bold text-zinc-600">Foundation</span></span>
                    </Link>

                    {/* Center: Navigation Links */}
                    <div className="hidden md:flex items-center justify-center gap-8 flex-1">
                        <Link to="/" className={`${isActive('/') ? 'text-red-600' : 'text-zinc-600'} nav-link-underline hover:text-red-600 transition-colors plus-jakarta-sans font-bold tracking-tight`}>Home</Link>
                        <Link to="/medicine-drive" className={`${isActive('/medicine-drive') ? 'text-red-600' : 'text-zinc-600'} nav-link-underline hover:text-red-600 transition-colors plus-jakarta-sans font-bold tracking-tight`}>Medicine Drive</Link>
                        <Link to="/gallery" className={`${isActive('/gallery') ? 'text-red-600' : 'text-zinc-600'} nav-link-underline hover:text-red-600 transition-colors plus-jakarta-sans font-bold tracking-tight`}>Gallery</Link>
                        <Link to="/volunteer" className={`${isActive('/volunteer') ? 'text-red-600' : 'text-zinc-600'} nav-link-underline hover:text-red-600 transition-colors plus-jakarta-sans font-bold tracking-tight`}>Volunteers</Link>
                        <Link to="/about" className={`${isActive('/about') ? 'text-red-600' : 'text-zinc-600'} nav-link-underline hover:text-red-600 transition-colors plus-jakarta-sans font-bold tracking-tight`}>About Us</Link>
                        <Link to="/our-team" className={`${isActive('/our-team') ? 'text-red-600' : 'text-zinc-600'} nav-link-underline hover:text-red-600 transition-colors plus-jakarta-sans font-bold tracking-tight`}>Our Team</Link>
                    </div>

                    {/* Right: Banto Zindagi Logo (no text) */}
                    <Link to="/" className="flex items-center flex-shrink-0 ml-auto md:ml-4">
                        <img src="/logo-bs-new.png" alt="Banto Zindagi Logo" className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover transition-transform duration-300 hover:scale-105 hover:opacity-95" />
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden ml-4 text-zinc-600 hover:text-red-600 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined text-3xl">
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
                {/* Loading overlay moved below nav for correct stacking */}

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-zinc-200 px-4 py-4 space-y-3 absolute top-full left-0 w-full shadow-lg">
                        <Link to="/" className={`block nav-link-underline ${isActive('/') ? 'text-red-600' : 'text-zinc-600'} hover:text-red-600 transition-colors plus-jakarta-sans font-bold py-2`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <Link to="/medicine-drive" className={`block nav-link-underline ${isActive('/medicine-drive') ? 'text-red-600' : 'text-zinc-600'} hover:text-red-600 transition-colors plus-jakarta-sans font-bold py-2`} onClick={() => setMobileMenuOpen(false)}>Medicine Drive</Link>
                        <Link to="/gallery" className={`block nav-link-underline ${isActive('/gallery') ? 'text-red-600' : 'text-zinc-600'} hover:text-red-600 transition-colors plus-jakarta-sans font-bold py-2`} onClick={() => setMobileMenuOpen(false)}>Gallery</Link>
                        <Link to="/donate-blood" className="block text-red-600 font-bold plus-jakarta-sans py-2" onClick={() => setMobileMenuOpen(false)}>🩸 Donate Blood</Link>
                        <Link to="/volunteer" className={`block ${isActive('/volunteer') ? 'text-red-600' : 'text-zinc-600'} hover:text-red-600 transition-colors plus-jakarta-sans font-bold py-2`} onClick={() => setMobileMenuOpen(false)}>Volunteers</Link>
                        <Link to="/about" className={`block ${isActive('/about') ? 'text-red-600' : 'text-zinc-600'} hover:text-red-600 transition-colors plus-jakarta-sans font-bold py-2`} onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                        <Link to="/our-team" className={`block ${isActive('/our-team') ? 'text-red-600' : 'text-zinc-600'} hover:text-red-600 transition-colors plus-jakarta-sans font-bold py-2`} onClick={() => setMobileMenuOpen(false)}>Our Team</Link>
                    </div>
                )}
            </nav>

            {/* Fullscreen Loading overlay (covers entire viewport, above nav) */}
            <div className={`fixed inset-0 z-[9999] transition-opacity ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} aria-hidden={!isLoading}>
                <div className="absolute inset-0 bg-white"></div>
                <div className="relative z-[10000] flex items-center justify-center h-full">
                    <div className="loader" aria-hidden></div>
                </div>
            </div>

            {/* Donate Blood CTA Bar - Separate from Nav, Below Header */}
            <div className="fixed top-[96px] w-full z-40 hidden md:block">
                <div className="flex justify-end pr-12 py-2 max-w-7xl mx-auto">
                    <Link to="/donate-blood" className="bg-[#7f1d1d] hover:bg-[#6b1515] text-white px-8 py-3.5 rounded-lg font-bold plus-jakarta-sans shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2">
                        🩸 Donate Blood
                    </Link>
                </div>
            </div>

            <main className="pt-28 md:pt-44 min-h-screen">
                <Outlet />
            </main>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/923238723663?text=Assalam%20o%20Alaikum!%20I%20am%20reaching%20out%20regarding%20Abu-ul-Qasim%20Blood%20Donor%20Society."
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-transform duration-300 drop-shadow-2xl hover:drop-shadow-[0_20px_40px_rgba(37,211,102,0.6)]"
                aria-label="Chat on WhatsApp"
            >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-16 h-16" />
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30"></span>
            </a>

            {/* Footer */}
            <footer className="bg-zinc-50 border-t border-zinc-200 mt-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 px-6 md:px-8 py-12 md:py-16 max-w-7xl mx-auto">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <img src="/logo-abs-new.png" alt="Abu-ul-Qasim Foundation" className="h-10 w-10 rounded-full object-cover" />
                            <span className="text-xl font-black text-zinc-900 plus-jakarta-sans">ABU-AL-QASIM Foundation</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed">A non-profit blood donation society working for humanity across Pakistan. Connecting blood donors with patients in need since 2017.</p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/share/17e4GYR57A/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-600 cursor-pointer transition-colors" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="https://wa.me/923238723663?text=Assalam%20o%20Alaikum!%20I%20am%20reaching%20out%20regarding%20Abu-ul-Qasim%20Blood%20Donor%20Society." target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-green-600 cursor-pointer transition-colors" aria-label="WhatsApp">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            </a>
                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=bantozindagi0981@gmail.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-red-600 cursor-pointer transition-colors" aria-label="Compose email in Gmail">
                                <span className="material-symbols-outlined">mail</span>
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold plus-jakarta-sans text-sm tracking-widest uppercase">Quick Links</h4>
                        <ul className="flex flex-col gap-3 text-zinc-500 plus-jakarta-sans text-sm">
                            <li><Link to="/donate-blood" className="hover:text-red-600 transition-colors">Find a Center</Link></li>
                            <li><Link to="/donate-blood" className="hover:text-red-600 transition-colors">Financial Donations</Link></li>
                            <li><Link to="/our-team" className="hover:text-red-600 transition-colors">Our Team</Link></li>
                            <li><Link to="/volunteer" className="hover:text-red-600 transition-colors">Become a Volunteer</Link></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold plus-jakarta-sans text-sm tracking-widest uppercase">Support</h4>
                        <ul className="flex flex-col gap-3 text-zinc-500 plus-jakarta-sans text-sm">
                            <li><a className="hover:text-red-600 underline underline-offset-4" href="#">Emergency Request</a></li>
                            <li><a className="hover:text-red-600 underline underline-offset-4" href="#">Privacy Policy</a></li>
                            <li><a className="hover:text-red-600 underline underline-offset-4" href="#">Donor Terms</a></li>
                            <li><Link to="/about" className="hover:text-red-600 underline underline-offset-4">Contact Support</Link></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold plus-jakarta-sans text-sm tracking-widest uppercase">Contact Us</h4>
                        <div className="text-zinc-500 text-sm leading-relaxed space-y-4">
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-600 text-lg mt-0.5">call</span>
                                <span className="text-zinc-900 font-bold">0323-8723663</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-600 text-lg mt-0.5">mail</span>
                                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=bantozindagi0981@gmail.com" target="_blank" rel="noopener noreferrer" className="text-zinc-900 font-bold hover:text-red-600 transition-colors">bantozindagi0981@gmail.com</a>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-600 text-lg mt-0.5">location_on</span>
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=Muqam+e+hayyat+road+Sargodha+Pakistan+40100"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-900 font-bold hover:text-red-600 transition-colors underline underline-offset-4"
                                >
                                    Muqam e hayyat road Sargodha,<br />Sargodha Pakistan 40100
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                    <div className="max-w-7xl mx-auto px-8 py-8 border-t border-zinc-200/50 text-center">
                    <p className="text-zinc-500 text-sm">© 2024 ABU-UL-QASIM Foundation — Banto Zindagi Blood Donor Society. Every Drop Counts.</p>
                </div>
            </footer >
        </>
    );
};

export default Layout;
