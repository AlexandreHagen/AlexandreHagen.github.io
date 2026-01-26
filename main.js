/**
 * Gary Sculpteur - Main JavaScript
 * Carousel, lightbox, animations, utilities and i18n
 */

(function() {
	'use strict';

	// =====================================================
	// CONFIGURATION - Modifier ici uniquement
	// =====================================================
	const CONFIG = {
		GA_MEASUREMENT_ID: 'G-XXXXXXXXXX' // Remplacer par ton ID GA4
	};

	// =====================================================
	// i18n - Internationalization Module
	// =====================================================
	const i18n = {
		translations: {},
		currentLang: 'en',

		async init() {
			this.currentLang = this.detectLanguage();
			await this.loadTranslations(this.currentLang);
			this.translatePage();
			this.initLanguageSelector();
		},

		detectLanguage() {
			// 1. URL param ?lang=fr
			const urlParams = new URLSearchParams(window.location.search);
			const urlLang = urlParams.get('lang');
			if (urlLang && ['en', 'fr'].includes(urlLang)) {
				localStorage.setItem('lang', urlLang);
				return urlLang;
			}

			// 2. localStorage preference
			const stored = localStorage.getItem('lang');
			if (stored && ['en', 'fr'].includes(stored)) return stored;

			// 3. Browser language
			const browserLang = navigator.language.slice(0, 2);
			return ['fr', 'en'].includes(browserLang) ? browserLang : 'en';
		},

		async loadTranslations(lang) {
			try {
				const response = await fetch(`assets/i18n/${lang}.json`);
				if (!response.ok) throw new Error('Translation file not found');
				this.translations = await response.json();
			} catch (error) {
				console.warn('i18n: Could not load translations for', lang, error);
				// Fallback to English if French fails
				if (lang !== 'en') {
					return this.loadTranslations('en');
				}
			}
		},

		t(key, fallback = '') {
			return this.translations[key] || fallback;
		},

		translatePage() {
			// Text content with data-i18n
			document.querySelectorAll('[data-i18n]').forEach(el => {
				const key = el.dataset.i18n;
				const translation = this.t(key);
				if (translation) {
					if (el.dataset.i18nHtml !== undefined) {
						el.innerHTML = translation;
					} else {
						el.textContent = translation;
					}
				}
			});

			// Alt attributes
			document.querySelectorAll('[data-i18n-alt]').forEach(el => {
				const translation = this.t(el.dataset.i18nAlt);
				if (translation) el.alt = translation;
			});

			// Placeholder attributes
			document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
				const translation = this.t(el.dataset.i18nPlaceholder);
				if (translation) el.placeholder = translation;
			});

			// Aria-label attributes
			document.querySelectorAll('[data-i18n-aria]').forEach(el => {
				const translation = this.t(el.dataset.i18nAria);
				if (translation) el.setAttribute('aria-label', translation);
			});

			// Title attributes
			document.querySelectorAll('[data-i18n-title]').forEach(el => {
				const translation = this.t(el.dataset.i18nTitle);
				if (translation) el.title = translation;
			});

			// Update html lang attribute
			document.documentElement.lang = this.currentLang;

			// Translate meta tags
			this.translateMeta();

			// Update hreflang links
			this.updateHreflang();
		},

		translateMeta() {
			// Determine page type from URL
			const path = window.location.pathname;
			let pageType = 'home';
			if (path.includes('contact')) pageType = 'contact';
			else if (path.includes('press')) pageType = 'press';

			// Title
			const title = this.t(`meta.${pageType}.title`);
			if (title) document.title = title;

			// Description
			const desc = document.querySelector('meta[name="description"]');
			const description = this.t(`meta.${pageType}.description`);
			if (desc && description) desc.content = description;

			// Open Graph
			const ogTitle = document.querySelector('meta[property="og:title"]');
			const ogTitleText = this.t(`og.${pageType}.title`);
			if (ogTitle && ogTitleText) ogTitle.content = ogTitleText;

			const ogDesc = document.querySelector('meta[property="og:description"]');
			const ogDescText = this.t(`og.${pageType}.description`);
			if (ogDesc && ogDescText) ogDesc.content = ogDescText;

			// Twitter
			const twitterTitle = document.querySelector('meta[name="twitter:title"]');
			if (twitterTitle && ogTitleText) twitterTitle.content = ogTitleText;

			const twitterDesc = document.querySelector('meta[name="twitter:description"]');
			const twitterDescText = this.t(`twitter.${pageType}.description`);
			if (twitterDesc && twitterDescText) twitterDesc.content = twitterDescText;
		},

		updateHreflang() {
			const currentUrl = window.location.origin + window.location.pathname;
			const baseUrl = currentUrl.replace(/\?.*$/, '');

			// Update or create hreflang links
			let enLink = document.querySelector('link[hreflang="en"]');
			let frLink = document.querySelector('link[hreflang="fr"]');
			let defaultLink = document.querySelector('link[hreflang="x-default"]');

			const enUrl = baseUrl + '?lang=en';
			const frUrl = baseUrl + '?lang=fr';

			if (enLink) enLink.href = enUrl;
			if (frLink) frLink.href = frUrl;
			if (defaultLink) defaultLink.href = baseUrl;

			// Update canonical
			const canonical = document.querySelector('link[rel="canonical"]');
			if (canonical) {
				canonical.href = this.currentLang === 'fr' ? frUrl : enUrl;
			}

			// Update OG URL
			const ogUrl = document.querySelector('meta[property="og:url"]');
			if (ogUrl) {
				ogUrl.content = this.currentLang === 'fr' ? frUrl : enUrl;
			}
		},

		initLanguageSelector() {
			document.querySelectorAll('.lang-btn').forEach(btn => {
				const lang = btn.dataset.lang;

				// Set active state
				if (lang === this.currentLang) {
					btn.classList.add('active');
				} else {
					btn.classList.remove('active');
				}

				// Prevent duplicate listeners
				if (!btn.dataset.i18nInit) {
					btn.dataset.i18nInit = 'true';
					btn.addEventListener('click', (e) => {
						e.preventDefault();
						this.setLanguage(lang);
					});
				}
			});
		},

		setLanguage(lang) {
			if (lang === this.currentLang) return;

			localStorage.setItem('lang', lang);

			// Update URL with lang parameter and reload
			const url = new URL(window.location);
			url.searchParams.set('lang', lang);
			window.location.href = url.toString();
		}
	};

	// Make i18n accessible globally for other scripts
	window.i18n = i18n;

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
	// LIGHTBOX with Zoom & Pan
	// =====================================================
	class Lightbox {
		constructor() {
			this.isOpen = false;
			this.currentImages = [];
			this.currentIndex = 0;
			this.scale = 1;
			this.minScale = 1;
			this.maxScale = 4;
			// Pan position
			this.panX = 0;
			this.panY = 0;
			this.isDragging = false;
			this.dragStartX = 0;
			this.dragStartY = 0;
			this.create();
			this.bindEvents();
		}

		create() {
			this.overlay = document.createElement('div');
			this.overlay.className = 'lightbox';
			this.overlay.innerHTML = `
				<button class="lightbox-close" aria-label="${i18n.t('lightbox.close', 'Close')}">&times;</button>
				<button class="lightbox-prev" aria-label="${i18n.t('lightbox.prev', 'Previous')}">&#10094;</button>
				<button class="lightbox-next" aria-label="${i18n.t('lightbox.next', 'Next')}">&#10095;</button>
				<div class="lightbox-content">
					<div class="lightbox-image-container">
						<img class="lightbox-image" src="" alt="">
					</div>
					<div class="lightbox-caption"></div>
					<a href="contact.html?quote=true#form" class="lightbox-cta">${i18n.t('lightbox.quote', 'Request a quote')}</a>
					<div class="lightbox-counter"></div>
				</div>
			`;
			document.body.appendChild(this.overlay);

			this.imageContainer = this.overlay.querySelector('.lightbox-image-container');
			this.image = this.overlay.querySelector('.lightbox-image');
			this.caption = this.overlay.querySelector('.lightbox-caption');
			this.counter = this.overlay.querySelector('.lightbox-counter');
			this.closeBtn = this.overlay.querySelector('.lightbox-close');
			this.prevBtn = this.overlay.querySelector('.lightbox-prev');
			this.nextBtn = this.overlay.querySelector('.lightbox-next');
			this.ctaBtn = this.overlay.querySelector('.lightbox-cta');
		}

		bindEvents() {
			this.closeBtn.addEventListener('click', () => this.close());
			this.prevBtn.addEventListener('click', () => this.prev());
			this.nextBtn.addEventListener('click', () => this.next());

			this.overlay.addEventListener('click', (e) => {
				if (e.target === this.overlay) {
					if (this.scale > 1) {
						this.resetZoom();
					} else {
						this.close();
					}
				}
			});

			// Double click to zoom
			this.image.addEventListener('dblclick', (e) => {
				e.preventDefault();
				if (this.scale > 1) {
					this.resetZoom();
				} else {
					this.zoom(1);
				}
			});

			// Mouse wheel zoom
			this.imageContainer.addEventListener('wheel', (e) => {
				e.preventDefault();
				const delta = e.deltaY > 0 ? -0.3 : 0.3;
				this.zoom(delta);
			});

			// Mouse drag for panning (desktop)
			this.image.addEventListener('mousedown', (e) => {
				if (this.scale > 1) {
					e.preventDefault();
					this.isDragging = true;
					this.dragStartX = e.clientX - this.panX;
					this.dragStartY = e.clientY - this.panY;
					this.image.style.cursor = 'grabbing';
					this.image.classList.add('dragging');
				}
			});

			document.addEventListener('mousemove', (e) => {
				if (this.isDragging && this.scale > 1) {
					this.panX = e.clientX - this.dragStartX;
					this.panY = e.clientY - this.dragStartY;
					this.updateTransform();
				}
			});

			document.addEventListener('mouseup', () => {
				if (this.isDragging) {
					this.isDragging = false;
					this.image.style.cursor = this.scale > 1 ? 'grab' : 'default';
					this.image.classList.remove('dragging');
				}
			});

			// Keyboard
			document.addEventListener('keydown', (e) => {
				if (!this.isOpen) return;
				if (e.key === 'Escape') this.close();
				if (e.key === 'ArrowLeft') this.prev();
				if (e.key === 'ArrowRight') this.next();
				if (e.key === '+' || e.key === '=') this.zoom(0.5);
				if (e.key === '-') this.zoom(-0.5);
			});

			// Touch events for swipe, pinch zoom & pan
			let touchStartX = 0;
			let touchStartY = 0;
			let initialDistance = 0;
			let isSingleTouch = false;

			this.image.addEventListener('touchstart', (e) => {
				if (e.touches.length === 1) {
					isSingleTouch = true;
					touchStartX = e.touches[0].clientX;
					touchStartY = e.touches[0].clientY;
					if (this.scale > 1) {
						this.isDragging = true;
						this.dragStartX = touchStartX - this.panX;
						this.dragStartY = touchStartY - this.panY;
						this.image.classList.add('dragging');
					}
				} else if (e.touches.length === 2) {
					isSingleTouch = false;
					this.isDragging = false;
					this.image.classList.remove('dragging');
					initialDistance = this.getTouchDistance(e.touches);
				}
			}, { passive: true });

			this.image.addEventListener('touchmove', (e) => {
				if (e.touches.length === 2 && initialDistance > 0) {
					// Pinch zoom
					const currentDistance = this.getTouchDistance(e.touches);
					const delta = (currentDistance - initialDistance) / 200;
					this.zoom(delta);
					initialDistance = currentDistance;
				} else if (e.touches.length === 1 && this.isDragging && this.scale > 1) {
					// Pan when zoomed
					e.preventDefault();
					this.panX = e.touches[0].clientX - this.dragStartX;
					this.panY = e.touches[0].clientY - this.dragStartY;
					this.updateTransform();
				}
			}, { passive: false });

			this.image.addEventListener('touchend', (e) => {
				if (isSingleTouch && !this.isDragging && this.scale === 1) {
					// Swipe to navigate (only when not zoomed)
					const diff = touchStartX - e.changedTouches[0].clientX;
					if (Math.abs(diff) > 50) {
						if (diff > 0) this.next();
						else this.prev();
					}
				}
				this.isDragging = false;
				this.image.classList.remove('dragging');
				initialDistance = 0;
				isSingleTouch = false;
			}, { passive: true });
		}

		getTouchDistance(touches) {
			const dx = touches[0].clientX - touches[1].clientX;
			const dy = touches[0].clientY - touches[1].clientY;
			return Math.sqrt(dx * dx + dy * dy);
		}

		updateTransform() {
			this.image.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
		}

		zoom(delta) {
			const oldScale = this.scale;
			this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));

			// Adjust pan to keep zoom centered
			if (oldScale !== this.scale) {
				const ratio = this.scale / oldScale;
				this.panX *= ratio;
				this.panY *= ratio;
			}

			// Reset pan if we're back to 1x
			if (this.scale === 1) {
				this.panX = 0;
				this.panY = 0;
			}

			this.updateTransform();
			this.image.style.cursor = this.scale > 1 ? 'grab' : 'default';
		}

		resetZoom() {
			this.scale = 1;
			this.panX = 0;
			this.panY = 0;
			this.updateTransform();
			this.image.style.cursor = 'default';
		}

		open(images, index = 0) {
			this.currentImages = images;
			this.currentIndex = index;
			this.resetZoom();
			this.updateImage();
			this.overlay.classList.add('active');
			this.isOpen = true;
			document.body.style.overflow = 'hidden';
		}

		close() {
			this.overlay.classList.remove('active');
			this.isOpen = false;
			document.body.style.overflow = '';
			this.resetZoom();
		}

		updateImage() {
			const item = this.currentImages[this.currentIndex];
			if (!item) return;

			this.image.src = item.src;
			this.image.alt = item.alt;
			this.caption.textContent = item.caption || item.alt;
			this.counter.textContent = `${this.currentIndex + 1} / ${this.currentImages.length}`;

			// Show/hide nav buttons
			const showNav = this.currentImages.length > 1;
			this.prevBtn.style.display = showNav ? 'flex' : 'none';
			this.nextBtn.style.display = showNav ? 'flex' : 'none';

			// Preload adjacent images
			this.preloadAdjacentImages();
		}

		preloadAdjacentImages() {
			if (this.currentImages.length <= 1) return;

			// Preload next image
			const nextIndex = (this.currentIndex + 1) % this.currentImages.length;
			const nextItem = this.currentImages[nextIndex];
			if (nextItem && nextItem.src) {
				const nextImg = new Image();
				nextImg.src = nextItem.src;
			}

			// Preload previous image
			const prevIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
			const prevItem = this.currentImages[prevIndex];
			if (prevItem && prevItem.src) {
				const prevImg = new Image();
				prevImg.src = prevItem.src;
			}
		}

		prev() {
			this.resetZoom();
			this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
			this.updateImage();
		}

		next() {
			this.resetZoom();
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
			this.createIndicators();
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
			this.prevBtn.setAttribute('aria-label', i18n.t('carousel.prev', 'Previous slide'));

			this.nextBtn = document.createElement('button');
			this.nextBtn.className = 'carousel-btn carousel-next';
			this.nextBtn.innerHTML = '&#10095;';
			this.nextBtn.setAttribute('aria-label', i18n.t('carousel.next', 'Next slide'));

			this.carousel.appendChild(this.prevBtn);
			this.carousel.appendChild(this.nextBtn);
		}

		createIndicators() {
			this.indicators = document.createElement('div');
			this.indicators.className = 'carousel-indicators';

			for (let i = 0; i < this.itemCount; i++) {
				const dot = document.createElement('button');
				dot.className = 'carousel-dot';
				dot.setAttribute('aria-label', `${i18n.t('carousel.goto', 'Go to image')} ${i + 1}`);
				dot.addEventListener('click', (e) => {
					e.stopPropagation();
					this.goTo(i);
				});
				this.indicators.appendChild(dot);
			}

			this.carousel.appendChild(this.indicators);
			this.dots = this.indicators.querySelectorAll('.carousel-dot');
		}

		updateIndicators() {
			this.dots.forEach((dot, index) => {
				dot.classList.toggle('active', index === this.currentIndex);
			});
		}

		goTo(index) {
			if (this.isAnimating || index === this.currentIndex) return;
			this.isAnimating = true;
			this.currentIndex = index;
			this.updateSlides();
			setTimeout(() => { this.isAnimating = false; }, this.options.speed);
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
			this.updateIndicators();
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

	// =====================================================
	// MOBILE MENU (Hamburger)
	// =====================================================
	function initMobileMenu() {
		const header = document.querySelector('.header');
		const menu = document.querySelector('.menu');
		const social = document.querySelector('.social');
		const langSelector = document.querySelector('.lang-selector');
		if (!header || !menu) return;

		// Create hamburger button
		const hamburger = document.createElement('button');
		hamburger.className = 'hamburger';
		hamburger.setAttribute('aria-label', 'Menu');
		hamburger.setAttribute('aria-expanded', 'false');
		hamburger.innerHTML = '<span></span><span></span><span></span>';

		// Insert hamburger in header
		header.appendChild(hamburger);

		// Clone social icons into mobile menu
		if (social) {
			const mobileSocial = social.cloneNode(true);
			mobileSocial.className = 'mobile-social';
			menu.appendChild(mobileSocial);
		}

		// Clone language selector into mobile menu
		if (langSelector) {
			const mobileLang = langSelector.cloneNode(true);
			mobileLang.className = 'mobile-lang';
			// Remove i18n-init flag so initLanguageSelector() will bind new event listeners
			mobileLang.querySelectorAll('.lang-btn').forEach(btn => {
				delete btn.dataset.i18nInit;
			});
			menu.appendChild(mobileLang);
		}

		// Toggle menu
		hamburger.addEventListener('click', () => {
			const isOpen = hamburger.classList.toggle('active');
			menu.classList.toggle('active');
			hamburger.setAttribute('aria-expanded', isOpen);
			document.body.style.overflow = isOpen ? 'hidden' : '';
		});

		// Close menu on link click
		menu.querySelectorAll('a').forEach(link => {
			link.addEventListener('click', () => {
				hamburger.classList.remove('active');
				menu.classList.remove('active');
				hamburger.setAttribute('aria-expanded', 'false');
				document.body.style.overflow = '';
			});
		});

		// Close menu on escape key
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && menu.classList.contains('active')) {
				hamburger.classList.remove('active');
				menu.classList.remove('active');
				hamburger.setAttribute('aria-expanded', 'false');
				document.body.style.overflow = '';
			}
		});

		// Close menu when clicking outside
		document.addEventListener('click', (e) => {
			if (menu.classList.contains('active') &&
				!menu.contains(e.target) &&
				!hamburger.contains(e.target)) {
				hamburger.classList.remove('active');
				menu.classList.remove('active');
				hamburger.setAttribute('aria-expanded', 'false');
				document.body.style.overflow = '';
			}
		});
	}

	// =====================================================
	// BACK TO TOP BUTTON
	// =====================================================
	function initBackToTop() {
		const btn = document.createElement('button');
		btn.className = 'back-to-top';
		btn.setAttribute('aria-label', i18n.t('aria.back.top', 'Back to top'));
		btn.innerHTML = '&#8593;';
		document.body.appendChild(btn);

		window.addEventListener('scroll', () => {
			if (window.scrollY > 300) {
				btn.classList.add('visible');
			} else {
				btn.classList.remove('visible');
			}
		});

		btn.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	// =====================================================
	// CONTACT FORM (AJAX)
	// =====================================================
	function initContactForm() {
		const form = document.querySelector('.contact-form');
		if (!form) return;

		// Pre-fill message if coming from quote CTA
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('quote') === 'true') {
			const messageField = form.querySelector('#message');
			if (messageField) {
				const quoteMessage = i18n.t('contact.quote.prefill', 'Hello,\n\nI would like to request a quote for a sculpture.\n\n');
				messageField.value = quoteMessage;
			}
		}

		const messages = {
			sending: i18n.t('contact.sending', 'Sending...'),
			success: i18n.t('contact.success', 'Message sent! We\'ll get back to you soon.'),
			error: i18n.t('contact.error', 'Error sending message. Please try again.'),
			submit: i18n.t('contact.send', 'Send')
		};

		const submitBtn = form.querySelector('button[type="submit"]');
		const originalBtnText = submitBtn.textContent;

		// Create message container
		const messageDiv = document.createElement('div');
		messageDiv.className = 'form-message';
		form.appendChild(messageDiv);

		// Real-time validation
		form.querySelectorAll('input, textarea').forEach(field => {
			field.addEventListener('blur', () => validateField(field));
			field.addEventListener('input', () => {
				if (field.classList.contains('invalid')) {
					validateField(field);
				}
			});
		});

		function validateField(field) {
			if (!field.checkValidity()) {
				field.classList.add('invalid');
				return false;
			} else {
				field.classList.remove('invalid');
				return true;
			}
		}

		function validateForm() {
			let isValid = true;
			form.querySelectorAll('input, textarea').forEach(field => {
				if (!validateField(field)) isValid = false;
			});
			return isValid;
		}

		form.addEventListener('submit', async (e) => {
			e.preventDefault();

			if (!validateForm()) return;

			// Show loading state
			submitBtn.disabled = true;
			submitBtn.textContent = messages.sending;
			messageDiv.className = 'form-message';
			messageDiv.textContent = '';

			try {
				// Check if running locally (test mode)
				const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

				if (isLocal) {
					// Simulate sending in test mode
					await new Promise(resolve => setTimeout(resolve, 1000));
					console.log('TEST MODE - Form data:', Object.fromEntries(new FormData(form)));
				} else {
					const response = await fetch(form.action, {
						method: 'POST',
						body: new FormData(form),
						headers: { 'Accept': 'application/json' }
					});

					if (!response.ok) {
						throw new Error('Server error');
					}
				}

				messageDiv.className = 'form-message success';
				messageDiv.textContent = messages.success;
				form.reset();
			} catch (error) {
				messageDiv.className = 'form-message error';
				messageDiv.textContent = messages.error;
			} finally {
				submitBtn.disabled = false;
				submitBtn.textContent = originalBtnText;
			}
		});
	}

	// Initialize when DOM is ready
	async function init() {
		// Load i18n first (critical for translated content)
		await i18n.init();

		initAnalytics();
		setYear();
		initFadeInAnimations();
		initMobileMenu();
		// Re-init language selector to bind events on cloned mobile menu buttons
		i18n.initLanguageSelector();
		initBackToTop();
		initContactForm();
		initCarousels();
		initLightbox();

		// Remove loading state to reveal content
		document.documentElement.classList.remove('i18n-loading');
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
