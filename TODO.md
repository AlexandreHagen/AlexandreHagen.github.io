# TODO - Ameliorations Site Gary Sculpteur

## Performance & Technique
- [ ] **Images WebP** - Convertir les JPG en WebP avec `<picture>` fallback (30% plus leger)
- [x] **Lazy loading lightbox** - Precharger l'image suivante/precedente
- [ ] **Service Worker (PWA)** - Mode hors-ligne + installation sur mobile
- [ ] **Fonts WOFF2** - Convertir les polices pour un chargement plus rapide
- [ ] **Critical CSS inline** - Injecter le CSS critique dans le `<head>`
- [ ] **Compression Brotli/Gzip** - Configurer via headers serveur

## UX & Navigation
- [x] **Indicateurs de carousel** - Points ou barre de progression pour voir sa position
- [x] **Zoom dans la lightbox** - Pinch-to-zoom sur mobile, molette sur desktop
- [x] **Menu hamburger mobile** - Navigation plus propre sur petits ecrans
- [x] **Bouton retour en haut** - Bouton flottant apres scroll
- [ ] **Mode plein ecran** - Bouton fullscreen dans la lightbox (Fullscreen API)
- [ ] **Slideshow automatique** - Option play/pause dans la lightbox
- [ ] **Galerie filtrable** - Filtrer par collection, taille, annee
- [ ] **Comparaison avant/apres** - Slider processus creation (argile → bronze)

## Contenu & SEO
- [ ] **Page par oeuvre** - URL dediee `/oeuvres/talos` (meilleur SEO)
- [ ] **Blog/Actualites** - Expositions, evenements, processus creatif
- [ ] **Temoignages clients** - Avis et photos d'installations
- [ ] **FAQ structuree** - Questions frequentes avec Schema.org FAQPage

## Design & Animations
- [ ] **Parallax sur banner** - Effet de profondeur au scroll
- [ ] **Curseur personnalise** - Curseur artistique sur tout le site
- [ ] **Transitions de page** - Fade entre les pages
- [ ] **Mode sombre toggle** - Bouton jour/nuit avec preference systeme
- [ ] **Effet Ken Burns** - Zoom subtil sur les images du carousel
- [ ] **Reveal au scroll** - Animations elaborees avec decalages

## Engagement & Conversion
- [x] **Bouton devis** - Call-to-action "Demander un devis" sur chaque oeuvre
- [ ] **Newsletter** - Capture d'emails pour les nouvelles oeuvres
- [ ] **Partage social** - Boutons dans la lightbox (Pinterest, Instagram, Facebook)
- [ ] **Instagram feed** - Afficher les derniers posts automatiquement
- [ ] **Pop-up sortie** - Capturer les emails avant depart

## Technique Avancee
- [x] **Formulaire AJAX** - Validation temps reel + envoi sans rechargement
- [ ] **Analytics evenements** - Tracker clics lightbox, temps passe, scroll depth
- [ ] **Sitemap dynamique** - Generer automatiquement a partir des oeuvres

---

## Fait
- [x] Structure bilingue FR/EN
- [x] Carousel CSS natif avec autoplay
- [x] Lightbox pour voir les oeuvres en grand
- [x] Schema.org JSON-LD pour SEO
- [x] Fichiers SEO (robots.txt, sitemap.xml, llms.txt)
- [x] Migration GA4 (configuration centralisee)
- [x] Suppression jQuery/Slick (site plus leger)
- [x] CSS moderne avec custom properties
- [x] Animations fade-in au scroll
- [x] 3 POC de design sur branches separees
- [x] Indicateurs de carousel (points de navigation)
- [x] Zoom dans la lightbox (molette + pinch-to-zoom + boutons +/- + pan/drag)
- [x] Menu hamburger mobile (avec reseaux sociaux)
- [x] Bouton retour en haut
- [x] Lazy loading lightbox (prechargement images adjacentes)
