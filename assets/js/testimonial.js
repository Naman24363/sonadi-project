// ========================================
// TESTIMONIALS PAGE FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Testimonial submission form - handled by Django, we just add enhancements
    // Note: The form in testimonialModal is submitted to Django, not simulated
    const testimonialModal = document.getElementById('testimonialModal');
    const modalForm = testimonialModal ? testimonialModal.querySelector('form') : null;
    
    // Add loading state on form submit (but let Django handle the actual submission)
    if (modalForm) {
        modalForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
                submitBtn.disabled = true;
            }
            // Don't prevent default - let Django handle the form submission
        });
    }

    // Handle image upload preview (for id_image field from Django form)
    const imageUpload = document.getElementById('id_image');
    const imagePreview = document.getElementById('image-preview');
    
    if (imageUpload && !imagePreview) {
        // If there's no preview element, create one after the input
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            let previewContainer = document.getElementById('image-preview');
            if (!previewContainer) {
                previewContainer = document.createElement('div');
                previewContainer.id = 'image-preview';
                previewContainer.className = 'image-preview';
                imageUpload.parentNode.appendChild(previewContainer);
            }
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" class="img-fluid rounded" style="max-width: 200px; max-height: 200px;">
                        <button type="button" class="btn btn-sm btn-danger mt-2" onclick="clearImagePreview()">Remove</button>
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                previewContainer.innerHTML = '';
            }
        });
    }

    // Clear image preview
    window.clearImagePreview = function() {
        const previewContainer = document.getElementById('image-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
        const imageInput = document.getElementById('id_image');
        if (imageInput) {
            imageInput.value = '';
        }
    };

    // Testimonial cards interaction
    const testimonialCards = document.querySelectorAll('.testimonials .card');
    
    // IMMEDIATE FIX: Force testimonial cards to be visible
    testimonialCards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'none';
        card.style.display = 'block';
        card.style.visibility = 'visible';
    });
    
    // Handle image loading errors and click events
    const testimonialImages = document.querySelectorAll('.testimonial-image');
    testimonialImages.forEach(img => {
        img.addEventListener('error', function() {
            this.src = '/static/img/cat1.jpg';
        });
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        // Add click event to open full-size image
        img.addEventListener('click', function() {
            if (typeof openImageModal === 'function') {
                openImageModal(this.src, this.alt);
            }
        });
        
        // Add hover effect
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    testimonialCards.forEach(card => {
        // Expand/collapse functionality
        const expandBtn = card.querySelector('.expand-btn');
        const shortText = card.querySelector('.testimonial-short');
        const fullText = card.querySelector('.testimonial-full');
        
        if (expandBtn && shortText && fullText) {
            expandBtn.addEventListener('click', function() {
                const isExpanded = fullText.style.display !== 'none';
                
                if (isExpanded) {
                    fullText.style.display = 'none';
                    shortText.style.display = 'block';
                    this.textContent = 'Read More';
                } else {
                    fullText.style.display = 'block';
                    shortText.style.display = 'none';
                    this.textContent = 'Read Less';
                    
                    // Animate expansion
                    if (typeof gsap !== 'undefined') {
                        gsap.from(fullText, {
                            duration: 0.3,
                            height: 0,
                            opacity: 0,
                            ease: 'power2.out'
                        });
                    }
                }
            });
        }
    });

    // Testimonial filtering
    const testimonialFilters = document.querySelectorAll('.testimonial-filter .filter-btn');
    testimonialFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            testimonialFilters.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked filter
            this.classList.add('active');
            
            const filterValue = this.dataset.filter;
            
            // Filter testimonial cards
            testimonialCards.forEach(card => {
                const category = card.dataset.category || '';
                
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block';
                    
                    // Animate card appearance
                    if (typeof gsap !== 'undefined') {
                        gsap.from(card, {
                            duration: 0.5,
                            scale: 0.9,
                            opacity: 0,
                            ease: 'back.out(1.7)'
                        });
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Rating stars functionality
    const ratingStars = document.querySelectorAll('.rating-input .star');
    const ratingValue = document.getElementById('ratingValue');
    
    ratingStars.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = index + 1;
            
            // Update rating value
            if (ratingValue) {
                ratingValue.value = rating;
            }
            
            // Update star display
            ratingStars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                    s.innerHTML = '<i class="fas fa-star"></i>';
                } else {
                    s.classList.remove('active');
                    s.innerHTML = '<i class="far fa-star"></i>';
                }
            });
        });
        
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const hoverRating = index + 1;
            
            ratingStars.forEach((s, i) => {
                if (i < hoverRating) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
    });

    // Remove hover effect when leaving rating area
    const ratingContainer = document.querySelector('.rating-input');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', function() {
            ratingStars.forEach(star => {
                star.classList.remove('hover');
            });
        });
    }

    // Testimonial carousel for featured testimonials
    const featuredCarousel = document.querySelector('.featured-testimonials');
    if (featuredCarousel) {
        let currentSlide = 0;
        const slides = featuredCarousel.querySelectorAll('.testimonial-slide');
        const totalSlides = slides.length;
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        }
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        }
        
        // Auto-rotate slides
        if (totalSlides > 1) {
            setInterval(nextSlide, 5000);
        }
        
        // Navigation buttons
        const nextBtn = featuredCarousel.querySelector('.carousel-next');
        const prevBtn = featuredCarousel.querySelector('.carousel-prev');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
    }

    // Load more testimonials functionality
    const loadMoreBtn = document.getElementById('loadMoreTestimonials');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more testimonials
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                // Here you would typically load more testimonials from the server
                showNotification('More testimonials loaded!', 'info');
                this.innerHTML = 'Load More';
                this.disabled = false;
            }, 1500);
        });
    }

    // Share testimonial functionality
    function shareTestimonial(testimonialId) {
        if (navigator.share) {
            navigator.share({
                title: 'Sonadi Testimonial',
                text: 'Check out this testimonial from Sonadi!',
                url: `${window.location.origin}/testimonials#${testimonialId}`
            }).catch(console.error);
        } else {
            // Fallback for browsers that don't support Web Share API
            const url = `${window.location.origin}/testimonials#${testimonialId}`;
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Testimonial link copied to clipboard!', 'success');
            }).catch(() => {
                showNotification('Unable to copy link', 'error');
            });
        }
    }

    // Add share buttons to testimonials
    testimonialCards.forEach(card => {
        const shareBtn = card.querySelector('.share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                const testimonialId = card.dataset.testimonialId || card.id;
                shareTestimonial(testimonialId);
            });
        }
    });

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 350px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Testimonials page animations - FIXED VERSION
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Animate testimonial cards - using correct selectors
        gsap.from('.testimonials .card', {
            scrollTrigger: {
                trigger: '.testimonials',
                start: 'top 90%'
            },
            duration: 0.2,
            y: 20,
            opacity: 0,
            stagger: 0.05,
            ease: 'power2.out'
        });

        // Animate submission form (only if it exists)
        const testimonialForm = document.querySelector('.testimonial-form');
        if (testimonialForm) {
            gsap.from('.testimonial-form', {
                scrollTrigger: {
                    trigger: '.testimonial-form',
                    start: 'top 80%'
                },
                duration: 0.5,
                y: 30,
                opacity: 0,
                ease: 'power2.out'
            });
        }

        // Animate featured testimonials (only if they exist)
        const featuredTestimonials = document.querySelector('.featured-testimonials');
        if (featuredTestimonials) {
            gsap.from('.featured-testimonials', {
                scrollTrigger: {
                    trigger: '.featured-testimonials',
                    start: 'top 80%'
                },
                duration: 0.5,
                scale: 0.98,
                opacity: 0,
                ease: 'power2.out'
            });
        }

        // Animate filter buttons (only if they exist)
        const testimonialFilter = document.querySelector('.testimonial-filter');
        if (testimonialFilter) {
            gsap.from('.testimonial-filter .filter-btn', {
                scrollTrigger: {
                    trigger: '.testimonial-filter',
                    start: 'top 90%'
                },
                duration: 0.3,
                y: 10,
                opacity: 0,
                stagger: 0.05,
                ease: 'power2.out'
            });
        }
    } else {
        // Fallback: Ensure testimonial cards are visible if GSAP fails
        testimonialCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    // Additional fallback: Force visibility after 1 second
    setTimeout(() => {
        testimonialCards.forEach(card => {
            card.style.opacity = '1';
            card.style.display = 'block';
            card.style.transform = 'none';
        });
    }, 1000);
});
