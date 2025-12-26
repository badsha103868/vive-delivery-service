import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const items = [
	{ quote: 'Fast and reliable — tracking is spot on.', author: 'Aisha', company: 'RetailCo' },
	{ quote: 'Easy scheduling and great support!', author: 'Marco', company: 'QuickShop' },
	{ quote: 'Saved us time and cost on last-mile.', author: 'Olivia', company: 'LocalBiz' },
];

export default function TestimonialCarousel() {
	const reduce = useReducedMotion();
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const intervalRef = useRef(null);

	useEffect(() => {
		if (reduce) return; // no autoplay when reduced motion
		clearInterval(intervalRef.current);
		if (!paused) {
			intervalRef.current = setInterval(() => {
				setIndex(i => (i + 1) % items.length);
			}, 4500);
		}
		return () => clearInterval(intervalRef.current);
	}, [paused, reduce]);

	const prev = () => setIndex(i => (i - 1 + items.length) % items.length);
	const next = () => setIndex(i => (i + 1) % items.length);

	if (reduce) {
		// simple fade carousel for reduced motion
		return (
			<div
				className="relative"
				onMouseEnter={() => setPaused(true)}
				onMouseLeave={() => setPaused(false)}
				aria-live="polite"
			>
				<AnimatePresence mode="wait">
					<motion.blockquote
						key={index}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.4 }}
						className="p-6 bg-base-100 shadow-md rounded flex gap-4 items-center"
					>
						<img
							src={`https://ui-avatars.com/api/?name=${encodeURIComponent(items[index].author)}&background=7c3aed&color=fff&size=128`}
							alt={`${items[index].author} avatar`}
							className="w-14 h-14 rounded-full ring-2 ring-primary object-cover"
						/>
						<div>
							<p className="text-lg">“{items[index].quote}”</p>
							<div className="mt-2 text-sm text-muted">— {items[index].author}, {items[index].company}</div>
						</div>
					</motion.blockquote>
				</AnimatePresence>
				<div className="flex gap-2 mt-4 justify-center">
					{items.map((_, i) => (
						<button
							key={i}
							className={`btn btn-xs ${i === index ? 'btn-primary' : 'btn-ghost'}`}
							onClick={() => setIndex(i)}
							aria-label={`Go to testimonial ${i + 1}`}
						/>
					))}
				</div>
			</div>
		);
	}

	// sliding mode
	return (
		<div
			className="relative overflow-hidden"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			aria-live="polite"
			role="region"
			aria-roledescription="carousel"
			aria-label="Customer testimonials"
		>
			{/* slider: each child is min-w-full flex-none so every slide fills the viewport */}
			<div className="flex slider" style={{ transform: `translateX(-${index * 100}%)` }}>
				{items.map((it, i) => (
					<div key={i} className="min-w-full flex-none px-2">
						<div className="p-6 bg-base-100 shadow-md rounded flex gap-4 items-center">
							<img
								src={`https://ui-avatars.com/api/?name=${encodeURIComponent(it.author)}&background=7c3aed&color=fff&size=128`}
								alt={`${it.author} avatar`}
								className="w-16 h-16 rounded-full ring-2 ring-primary object-cover"
								loading="lazy"
							/>
							<div>
								<p className="text-lg">“{it.quote}”</p>
								<div className="mt-2 text-sm text-muted">— {it.author}, <span className="font-medium">{it.company}</span></div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* controls */}
			<button
				onClick={prev}
				className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-square btn-ghost"
				aria-label="Previous testimonial"
			>‹</button>
			<button
				onClick={next}
				className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-square btn-ghost"
				aria-label="Next testimonial"
			>›</button>

			{/* indicators */}
			<div className="flex gap-2 mt-4 justify-center">
				{items.map((_, i) => (
					<button
						key={i}
						className={`btn btn-xs ${i === index ? 'btn-primary' : 'btn-ghost'}`}
						onClick={() => setIndex(i)}
						aria-label={`Go to testimonial ${i + 1}`}
					/>
				))}
			</div>
		</div>
	);
}
