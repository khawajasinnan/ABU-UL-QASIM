import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageCarousel = ({ images = [], heightClass = 'h-64 md:h-80 lg:h-96', autoPlay = true, interval = 4500, showDots = true }) => {
  // Normalize slides to objects { src, caption }
  const slides = images.map(img => typeof img === 'string' ? { src: img, caption: '' } : ({ src: img.src || img, caption: img.caption || img.alt || '' }));
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const startAutoplay = useCallback(() => {
    if (!autoPlay || count <= 1) return;
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setDir(1);
      setIndex(i => (i + 1) % count);
    }, interval);
  }, [autoPlay, count, interval]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const go = (next, direction = 1) => {
    if (count <= 1) return;
    setDir(direction);
    setIndex(((next % count) + count) % count);
  };

  const variants = {
    enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 1.02 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.98 }),
  };

  // drag swipe handling using framer-motion drag
  const handleDragEnd = (e, { offset: { x } }) => {
    if (x < -80) go(index + 1, 1);
    else if (x > 80) go(index - 1, -1);
  };

  // keyboard navigation when focused
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (ev) => {
      if (ev.key === 'ArrowRight') go(index + 1, 1);
      if (ev.key === 'ArrowLeft') go(index - 1, -1);
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [index]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
      onTouchStart={stopAutoplay}
      onTouchEnd={startAutoplay}
      className={`relative w-full ${heightClass} overflow-hidden rounded-2xl`}
    >
      <div className="absolute inset-0">
        <AnimatePresence custom={dir} initial={false} mode="wait">
          {count > 0 && (
            <motion.img
              key={index}
              src={slides[index].src}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 120, damping: 22 }}
              className="object-cover w-full h-full"
              alt={slides[index].caption || `Slide ${index + 1}`}
              loading="lazy"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            />
          )}
        </AnimatePresence>
      </div>

      {/* caption overlay */}
      {count > 0 && (
        <motion.div key={`cap-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }} className="absolute left-4 bottom-4 z-40 max-w-xl">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-sm md:text-base font-semibold">{slides[index].caption || ''}</div>
            <div className="text-xs text-zinc-200 mt-1">{index + 1} of {count}</div>
          </div>
        </motion.div>
      )}

      {/* progress bar (fills left-to-right in red) */}
      {count > 1 && (
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-white/20 z-40">
          <motion.div key={`progress-${index}`} initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: interval / 1000, ease: 'linear' }} className="h-full bg-red-600" />
        </div>
      )}

      {/* arrows */}
      {count > 1 && (
        <>
          <button aria-label="Previous" onClick={() => go(index - 1, -1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/100 shadow-lg p-3 rounded-full z-30">
            <svg className="w-6 h-6 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button aria-label="Next" onClick={() => go(index + 1, 1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/100 shadow-lg p-3 rounded-full z-30">
            <svg className="w-6 h-6 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </>
      )}

      {/* dots */}
      {showDots && count > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 z-30">
          {slides.map((_, i) => (
            <button key={i} aria-label={`Go to slide ${i + 1}`} className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full transition-all ${i === index ? 'bg-red-600 scale-125' : 'bg-white/70'}`} onClick={() => go(i, i > index ? 1 : -1)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
