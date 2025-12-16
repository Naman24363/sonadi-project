// ========================================
// CONTACT PAGE FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Contact form specific functionality
    // Note: Contact form is handled by Django, this JS only adds enhancements
    const contactForm = document.querySelector('form[method="POST"]');
    
    if (contactForm && contactForm.closest('.contact-card-wrapper')) {
        // Add loading state on form submit (but let Django handle the actual submission)
        contactForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                // Use setTimeout to allow form submission to proceed before disabling
                setTimeout(function() {
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';
                    submitBtn.disabled = true;
                }, 10);
            }
            // Don't prevent default - let Django handle the form submission
        });
    }

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
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Contact page animations
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Animate contact form
        gsap.from('.contact-form', {
            scrollTrigger: {
                trigger: '.contact-form',
                start: 'top 80%'
            },
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power2.out'
        });

        // Animate contact info cards
        gsap.from('.contact-info .card', {
            scrollTrigger: {
                trigger: '.contact-info',
                start: 'top 80%'
            },
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.2,
            ease: 'power2.out'
        });

        // Animate map container
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            gsap.from(mapContainer, {
                scrollTrigger: {
                    trigger: mapContainer,
                    start: 'top 80%'
                },
                duration: 1,
                scale: 0.9,
                opacity: 0,
                ease: 'power2.out'
            });
        }
    }

    // Google Maps integration (if needed)
    function initMap() {
        // Initialize Google Maps here if used
        // Map initialization placeholder - replace with actual map implementation
        // console.log('Map initialization placeholder'); // Removed for production
    }

    // Office hours toggle
    const officeHoursToggle = document.querySelector('.office-hours-toggle');
    if (officeHoursToggle) {
        officeHoursToggle.addEventListener('click', function() {
            const hoursDetails = document.querySelector('.office-hours-details');
            if (hoursDetails) {
                hoursDetails.classList.toggle('show');
                this.textContent = hoursDetails.classList.contains('show') ? 'Hide Hours' : 'Show Hours';
            }
        });
    }
});
