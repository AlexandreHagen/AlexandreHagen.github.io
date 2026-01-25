/**
 * Gary Sculpteur - Main JavaScript
 * Carousel, lightbox, animations and utilities
 */

(function() {
	'use strict';

	// =====================================================
	// CONFIGURATION - Modifier ici uniquement
	// =====================================================
	const CONFIG = {
		GA_MEASUREMENT_ID: 'G-XXXXXXXXXX' // Remplacer par ton ID GA4
	};

	// Google Analytics 4
	function initAnalytics() {
		if (!CONFIG.GA_MEASUREMENT_ID || CONFIG.GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
			console.log('Google Analytics: ID non configure');
			return;
		}

		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_MEASUREMENT_ID}`;
		document.head.appendChild(script);

		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		window.gtag = gtag;
		gtag('js', new Date());
		gtag('config', CONFIG.GA_MEASUREMENT_ID);
	}

	// Set current year in footer
	function setYear() {
		const yearElement = document.getElementById('year');
		if (yearElement) {
			yearElement.textContent = new Date().getFullYear();
		}
	}

	// Intersection Observer for fade-in animations
	function initFadeInAnimations() {
		const fadeElements = document.querySelectorAll('.fade-in');
		if (!fadeElements.length) return;

		if (!('IntersectionObserver' in window)) {
			fadeElements.forEach(el => el.classList.add('visible'));
			return;
		}

		const observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.1 });

		fadeElements.forEach(el => observer.observe(el));
	}

	// =====================================================
	// LIGHTBOX
	// =====================================================
	class Lightbox {
		constructor() {
			this.isOpen = false;
			this.currentImages = [];
			this.currentIndex = 0;
			this.create();
			this.bindEvents();
		}

		create() {
			this.overlay = document.createElement('div');
			this.overlay.className = 'lightbox';
			this.overlay.innerHTML = `
				<button class="lightbox-close" aria-label="Fermer">&times;</button>
				<button class="lightbox-prev" aria-label="Precedent">&#10094;</button>
				<button class="lightbox-next" aria-label="Suivant">&#10095;</button>
				<div class="lightbox-content">
					<img class="lightbox-image" src="" alt="">
					<div class="lightbox-caption"></div>
				</div>
			`;
			document.body.appendChild(this.overlay);

			this.image = this.overlay.querySelector('.lightbox-image');
			this.caption = this.overlay.querySelector('.lightbox-caption');
			this.closeBtn = this.overlay.querySelector('.lightbox-close');
			this.prevBtn = this.overlay.querySelector('.lightbox-prev');
			this.nextBtn = this.overlay.querySelector('.lightbox-next');
		}

		bindEvents() {
			this.closeBtn.addEventListener('click', () => this.close());
			this.prevBtn.addEventListener('click', () => this.prev());
			this.nextBtn.addEventListener('click', () => this.next());

			this.overlay.addEventListener('click', (e) => {
				if (e.target === this.overlay) this.close();
			});

			document.addEventListener('keydown', (e) => {
				if (!this.isOpen) return;
				if (e.key === 'Escape') this.close();
				if (e.key === 'ArrowLeft') this.prev();
				if (e.key === 'ArrowRight') this.next();
			});

			// Touch swipe
			let touchStartX = 0;
			this.overlay.addEventListener('touchstart', (e) => {
				touchStartX = e.changedTouches[0].screenX;
			}, { passive: true });

			this.overlay.addEventListener('touchend', (e) => {
				const diff = touchStartX - e.changedTouches[0].screenX;
				if (Math.abs(diff) > 50) {
					if (diff > 0) this.next();
					else this.prev();
				}
			}, { passive: true });
		}

		open(images, index = 0) {
			this.currentImages = images;
			this.currentIndex = index;
			this.updateImage();
			this.overlay.classList.add('active');
			this.isOpen = true;
			document.body.style.overflow = 'hidden';
		}

		close() {
			this.overlay.classList.remove('active');
			this.isOpen = false;
			document.body.style.overflow = '';
		}

		updateImage() {
			const item = this.currentImages[this.currentIndex];
			if (!item) return;

			this.image.src = item.src;
			this.image.alt = item.alt;
			this.caption.textContent = item.caption || item.alt;

			// Show/hide nav buttons
			const showNav = this.currentImages.length > 1;
			this.prevBtn.style.display = showNav ? 'flex' : 'none';
			this.nextBtn.style.display = showNav ? 'flex' : 'none';
		}

		prev() {
			this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
			this.updateImage();
		}

		next() {
			this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;
			this.updateImage();
		}
	}

	// Global lightbox instance
	let lightbox = null;

	function initLightbox() {
		lightbox = new Lightbox();

		// Add click handlers to carousel items
		document.querySelectorAll('.carousel').forEach(carousel => {
			const items = carousel.querySelectorAll('.carousel-item');
			const images = Array.from(items).map(item => {
				const img = item.querySelector('img');
				const caption = item.querySelector('figcaption');
				return {
					src: img ? img.src : '',
					alt: img ? img.alt : '',
					caption: caption ? caption.textContent : (img ? img.alt : '')
				};
			});

			items.forEach((item, index) => {
				item.style.cursor = 'pointer';
				item.addEventListener('click', () => {
					lightbox.open(images, index);
				});
			});
		});
	}

	// =====================================================
	// CAROUSEL
	// =====================================================
	class Carousel {
		constructor(element, options = {}) {
			this.carousel = element;
			this.items = Array.from(element.querySelectorAll('.carousel-item'));
			this.itemCount = this.items.length;

			if (this.itemCount === 0) return;

			this.options = {
				autoplay: options.autoplay !== undefined ? options.autoplay : true,
				autoplaySpeed: options.autoplaySpeed || 5000,
				speed: options.speed || 500,
				...options
			};

			this.currentIndex = 0;
			this.isAnimating = false;
			this.autoplayTimer = null;
			this.touchStartX = 0;
			this.touchEndX = 0;

			this.init();
		}

		init() {
			this.createWrapper();
			this.createNavigation();
			this.updateSlides();
			this.bindEvents();

			if (this.options.autoplay) {
				this.startAutoplay();
			}

			window.addEventListener('resize', () => this.updateSlides());
		}

		getSlideWidth() {
			const width = window.innerWidth;
			if (width >= 1024) return 33.333;
			if (width >= 768) return 50;
			return 100;
		}

		createWrapper() {
			this.track = document.createElement('div');
			this.track.className = 'carousel-track';

			this.items.forEach(item => {
				this.track.appendChild(item);
			});

			this.carousel.innerHTML = '';
			this.carousel.appendChild(this.track);
		}

		createNavigation() {
			this.prevBtn = document.createElement('button');
			this.prevBtn.className = 'carousel-btn carousel-prev';
			this.prevBtn.innerHTML = '&#10094;';
			this.prevBtn.setAttribute('aria-label', 'Previous slide');

			this.nextBtn = document.createElement('button');
			this.nextBtn.className = 'carousel-btn carousel-next';
			this.nextBtn.innerHTML = '&#10095;';
			this.nextBtn.setAttribute('aria-label', 'Next slide');

			this.carousel.appendChild(this.prevBtn);
			this.carousel.appendChild(this.nextBtn);
		}

		bindEvents() {
			this.prevBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				this.prev();
			});
			this.nextBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				this.next();
			});

			this.carousel.addEventListener('mouseenter', () => this.stopAutoplay());
			this.carousel.addEventListener('mouseleave', () => {
				if (this.options.autoplay) this.startAutoplay();
			});

			this.carousel.addEventListener('touchstart', (e) => {
				this.touchStartX = e.changedTouches[0].screenX;
				this.stopAutoplay();
			}, { passive: true });

			this.carousel.addEventListener('touchend', (e) => {
				this.touchEndX = e.changedTouches[0].screenX;
				this.handleSwipe();
				if (this.options.autoplay) this.startAutoplay();
			}, { passive: true });

			this.carousel.setAttribute('tabindex', '0');
			this.carousel.addEventListener('keydown', (e) => {
				if (e.key === 'ArrowLeft') this.prev();
				if (e.key === 'ArrowRight') this.next();
			});
		}

		handleSwipe() {
			const diff = this.touchStartX - this.touchEndX;
			if (Math.abs(diff) > 50) {
				if (diff > 0) this.next();
				else this.prev();
			}
		}

		updateSlides() {
			const slideWidth = this.getSlideWidth();
			const visibleSlides = Math.round(100 / slideWidth);

			this.items.forEach((item, index) => {
				item.classList.remove('active', 'prev', 'next');
				item.style.flex = `0 0 ${slideWidth}%`;

				const relativeIndex = (index - this.currentIndex + this.itemCount) % this.itemCount;

				if (relativeIndex === 0) {
					item.classList.add('active');
				} else if (relativeIndex === this.itemCount - 1) {
					item.classList.add('prev');
				} else if (relativeIndex === 1) {
					item.classList.add('next');
				}
			});

			let offset;
			if (visibleSlides === 3) {
				offset = -(this.currentIndex * slideWidth) + slideWidth;
			} else if (visibleSlides === 2) {
				offset = -(this.currentIndex * slideWidth) + (slideWidth / 2);
			} else {
				offset = -(this.currentIndex * slideWidth);
			}

			this.track.style.transform = `translateX(${offset}%)`;
		}

		getPrevIndex() {
			return (this.currentIndex - 1 + this.itemCount) % this.itemCount;
		}

		getNextIndex() {
			return (this.currentIndex + 1) % this.itemCount;
		}

		next() {
			if (this.isAnimating) return;
			this.isAnimating = true;
			this.currentIndex = this.getNextIndex();
			this.updateSlides();
			setTimeout(() => { this.isAnimating = false; }, this.options.speed);
		}

		prev() {
			if (this.isAnimating) return;
			this.isAnimating = true;
			this.currentIndex = this.getPrevIndex();
			this.updateSlides();
			setTimeout(() => { this.isAnimating = false; }, this.options.speed);
		}

		startAutoplay() {
			this.stopAutoplay();
			this.autoplayTimer = setInterval(() => this.next(), this.options.autoplaySpeed);
		}

		stopAutoplay() {
			if (this.autoplayTimer) {
				clearInterval(this.autoplayTimer);
				this.autoplayTimer = null;
			}
		}
	}

	function initCarousels() {
		const carousels = document.querySelectorAll('.carousel');
		carousels.forEach(carousel => {
			new Carousel(carousel, {
				autoplay: true,
				autoplaySpeed: 5000,
				speed: 500
			});
		});
	}

	// Initialize when DOM is ready
	function init() {
		initAnalytics();
		setYear();
		initFadeInAnimations();
		initCarousels();
		initLightbox();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
