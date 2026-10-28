import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
  { text: "They responded immediately and saved my sister's life.", author: 'Amina R.' },
  { text: 'Volunteering here changed how I see community service — truly meaningful.', author: 'Ali Khan' },
  { text: 'Professional, caring, and always ready to help in emergencies.', author: 'Dr. Saleem' },
  { text: 'The team made donating easy and comfortable. Highly recommended.', author: 'Hira S.' },
];

const QuoteCarousel = ({ className = '' }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6 }}
          className="p-6 md:p-10 rounded-2xl bg-white/95 text-zinc-900 shadow-xl border border-zinc-100 max-w-3xl mx-auto text-center"
        >
          <p className="text-lg md:text-2xl font-semibold">“{QUOTES[idx].text}”</p>
          <cite className="block mt-4 text-sm text-zinc-500">— {QUOTES[idx].author}</cite>
        </motion.blockquote>
      </AnimatePresence>

      <div className="absolute left-0 right-0 bottom-3 flex items-center justify-center gap-2">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Show quote ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-red-600 scale-125' : 'bg-zinc-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuoteCarousel;
