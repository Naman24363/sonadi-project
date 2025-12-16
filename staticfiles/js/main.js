// ========================================
// MAIN.JS SHARED FUNCTIONALITY
// ========================================

// Initialize all core functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lazy loading
    if (typeof lazyLoad !== 'undefined') {
        lazyLoad.init();
    }

    // Initialize modal functionality
    if (typeof modal !== 'undefined') {
        modal.init();
    }

    // Initialize form validation
    if (typeof formValidation !== 'undefined') {
        formValidation.init();
    }

    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof utils !== 'undefined') {
                utils.smoothScroll(anchor.getAttribute('href'));
            }
        });
    });

    // Add animation to elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');

        elements.forEach(element => {
            if (typeof utils !== 'undefined' && utils.isInViewport(element)) {
                element.classList.add('animated');
            }
        });
    };

    // Run animation check on scroll
    if (typeof utils !== 'undefined') {
        window.addEventListener('scroll', utils.throttle(animateOnScroll, 100));

        // Run initial animation check
        animateOnScroll();
    }

    // Initialize core animations (e.g., GSAP)
    if (typeof CoreAnimations !== 'undefined') {
        // Small delay to ensure GSAP is loaded
        setTimeout(() => {
            CoreAnimations.init();
        }, 100);
    }

    // console.log('Main.js core functionality initialized'); // Removed for production
});
