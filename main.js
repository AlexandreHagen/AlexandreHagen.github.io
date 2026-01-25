/**
 * Gary Sculpteur - Main JavaScript
 * Carousel, animations and utilities
 */

(function() {
	'use strict';

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
			fadeElements.forEach(function(el) {
				el.classList.add('visible');
			});
			return;
		}

		const observer = new IntersectionObserver(function(entries) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					observer.unobserve(entry.target);
				}
			});
		}, { threshold: 0.1 });

		fadeElements.forEach(function(el) {
			observer.observe(el);
		});
	}

	// Carousel Class
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

			// Update on resize
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
			this.prevBtn.addEventListener('click', () => this.prev());
			this.nextBtn.addEventListener('click', () => this.next());

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

			// Calculate offset to center the active slide
			let offset;
			if (visibleSlides === 3) {
				// Desktop: center the active slide (show 1 before and 1 after)
				offset = -(this.currentIndex * slideWidth) + slideWidth;
			} else if (visibleSlides === 2) {
				// Tablet: offset to show active on left side
				offset = -(this.currentIndex * slideWidth) + (slideWidth / 2);
			} else {
				// Mobile: single slide view
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

	// Initialize carousels
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
		setYear();
		initFadeInAnimations();
		initCarousels();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
