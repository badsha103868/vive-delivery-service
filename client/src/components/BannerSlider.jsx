import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const slides = [
	{
		id: 1,
		title: 'Ship faster with real-time tracking',
		subtitle: 'Optimize routes and deliver on time, every time.',
		img: 'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1600&q=80',
		cta: 'Start Shipping',
	},
	{
		id: 2,
		title: 'Same-day delivery in select cities',
		subtitle: 'Flexible fulfillment with reliable local partners.',
		img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1600&q=80',
		cta: 'Check Availability',
	},
	{
		id: 3,
		title: 'Transparent pricing, no surprises',
		subtitle: 'Upfront rates, easy billing and real-time analytics.',
		img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1600&q=80',
		cta: 'View Plans',
	},
];

const FALLBACK = 'https://via.placeholder.com/1600x900/0ea5a4/ffffff?text=Vive+Delivery'; // colored fallback (teal bg)

export default function BannerSlider() {
	const reduce = useReducedMotion();
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (reduce) return;
		const id = setInterval(() => {
			if (!paused) setIndex((i) => (i + 1) % slides.length);
		}, 5000);
		return () => clearInterval(id);
	}, [paused, reduce]);

	// ensure controls exist and use safe modulo math
	const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
	const next = () => setIndex((i) => (i + 1) % slides.length);

	useEffect(() => {
		// Prefetch images to avoid blank slides when user navigates quickly
		slides.forEach((s) => {
			const img = new Image();
			img.src = s.img;
			img.onerror = () => {
				img.src = FALLBACK;
			};
		});
	}, []);

	function handleImgError(e) {
		// avoid infinite loop if fallback also errors
		if (!e?.target) return;
		if (e.target.dataset.fallback) return;
		e.target.dataset.fallback = '1';
		e.target.src = FALLBACK;
		// also apply fallback as CSS background on parent (best-effort)
		const parent = e.target.closest('.banner-slide');
		if (parent) parent.style.backgroundImage = `url(${FALLBACK})`;
	}

	if (reduce) {
		const s = slides[0];
		return (
			<div className="banner">
				<div className="banner-slide" role="img" aria-label={s.title}>
					<img
						src={s.img}
						alt={s.title}
						className="absolute inset-0 w-full h-full object-cover"
						onError={handleImgError}
						loading="lazy"
					/>
					<div className="banner-overlay container mx-auto px-4">
						<div className="text-white max-w-xl">
							<h2 className="text-2xl md:text-4xl font-bold">{s.title}</h2>
							<p className="mt-2 text-lg">{s.subtitle}</p>
							<div className="mt-4">
								<button className="btn btn-primary">{s.cta}</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className="banner"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			role="region"
			aria-roledescription="carousel"
			aria-label="Promotional banners"
		>
			<div className="slider" style={{ transform: `translateX(-${index * 100}%)` }}>
				{slides.map((s) => (
					<div
						key={s.id}
						className="min-w-full flex-none banner-slide relative"
						role="group"
						aria-roledescription="slide"
						aria-label={s.title}
						style={{
							backgroundImage: `url(${s.img})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
					>
						{/* hidden <img> guarantees browser loads the image and triggers onError if it fails */}
						<img
							src={s.img}
							alt={s.title}
							aria-hidden="true"
							className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
							onError={handleImgError}
							loading="lazy"
						/>
						<div className="banner-overlay container mx-auto px-4">
							<div className="text-white max-w-xl">
								<h2 className="text-2xl md:text-4xl font-bold leading-tight">{s.title}</h2>
								<p className="mt-2 text-lg">{s.subtitle}</p>
								<div className="mt-4">
									<button className="btn btn-primary mr-3">{s.cta}</button>
									<button className="btn btn-ghost">Learn more</button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* controls */}
			<button
				onClick={prev}
				aria-label="Previous banner"
				className="absolute left-3 top-1/2 -translate-y-1/2 btn btn-square btn-ghost z-30"
			>
				‹
			</button>
			<button
				onClick={next}
				aria-label="Next banner"
				className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-square btn-ghost z-30"
			>
				›
			</button>

			{/* indicators (absolute bottom center) */}
			<div className="absolute left-0 right-0 bottom-4 z-30 flex justify-center gap-2 px-4">
				{slides.map((_, i) => (
					<button
						key={i}
						className={`btn btn-xs ${i === index ? 'btn-primary' : 'btn-ghost'}`}
						onClick={() => setIndex(i)}
						aria-label={`Go to slide ${i + 1}`}
					/>
				))}
			</div>
		</div>
	);
}
