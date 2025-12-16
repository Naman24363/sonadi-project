// ========================================
// DONATION PAGE FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Clear any stuck notifications on page load
    const existingNotifications = document.querySelectorAll('.alert.position-fixed');
    existingNotifications.forEach(notification => notification.remove());
    
    // Clear form fields to ensure proper placeholder display - updated for new form structure
    const formInputs = document.querySelectorAll('#donationForm input[type="text"], #donationForm input[type="email"], #donationForm input[type="tel"], #donationForm textarea');
    formInputs.forEach(input => {
        // Clear any pre-filled values for the floating label forms
        if (input.value !== '') {
            input.value = '';
        }
        // Ensure placeholder is set to space for floating labels
        if (input.placeholder === '') {
            input.placeholder = ' ';
        }
    });
    
    // Special handling for custom amount field
    const customAmountInput = document.getElementById('customAmount');
    if (customAmountInput) {
        customAmountInput.value = '';
        customAmountInput.placeholder = '₹ Enter amount';
    }
    
    // Donation amount selection
    const donationAmounts = document.querySelectorAll('.amount-option:not(.custom-amount)');
    const customAmountContainer = document.querySelector('.amount-option.custom-amount');
    const donationForm = document.getElementById('donationForm');
    const selectedAmountInput = document.getElementById('selectedAmount');
    
    // Handle preset donation amounts
    donationAmounts.forEach(amount => {
        amount.addEventListener('click', function() {
            // Remove active class from all amounts
            document.querySelectorAll('.amount-option').forEach(a => a.classList.remove('selected'));
            
            // Add selected class to clicked amount
            this.classList.add('selected');
            
            // Clear custom amount
            if (customAmountInput) {
                customAmountInput.value = '';
            }
            
            // Store selected amount
            const selectedAmount = this.dataset.amount;
            if (selectedAmountInput) {
                selectedAmountInput.value = selectedAmount;
            }
            
            // Update impact display
            updateImpactDisplay(selectedAmount);
        });
    });

    // Handle custom amount input
    if (customAmountInput) {
        customAmountInput.addEventListener('input', function() {
            // Remove selected class from preset amounts
            donationAmounts.forEach(a => a.classList.remove('selected'));
            
            // Add selected class to custom amount container
            if (customAmountContainer) {
                customAmountContainer.classList.add('selected');
            }
            
            // Update selected amount
            if (selectedAmountInput) {
                selectedAmountInput.value = this.value;
            }
            
            // Update impact display
            updateImpactDisplay(this.value);
        });

        customAmountInput.addEventListener('focus', function() {
            // Remove selected class from preset amounts
            donationAmounts.forEach(a => a.classList.remove('selected'));
            
            // Add selected class to custom amount container
            if (customAmountContainer) {
                customAmountContainer.classList.add('selected');
            }
        });
    }

    // Form validation and submission
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const amount = selectedAmountInput ? selectedAmountInput.value : null;
            
            // Validate amount
            if (!amount || amount < 50) {
                showNotification('Please select or enter a donation amount of at least ₹50', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const form = this;
            
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
                submitBtn.disabled = true;
            }
            
            // Small delay to show loading state, then submit
            setTimeout(() => {
                form.submit();
            }, 100);
        });
    }

    // Impact display function
    function updateImpactDisplay(amount) {
        const impactDisplay = document.querySelector('.impact-display');
        if (!impactDisplay || !amount || amount <= 0) return;
        
        const impacts = {
            50: 'Feed 1 animal for a day',
            100: 'Feed 2 animals for a day',
            250: 'Vaccinate 1 animal',
            500: 'Provide medical care for 1 animal',
            1000: 'Sponsor an animal rescue mission',
            2500: 'Support our shelter for a week',
            5000: 'Support our shelter for a month'
        };
        
        let impact = '';
        for (const [threshold, description] of Object.entries(impacts)) {
            if (amount >= threshold) {
                impact = description;
            }
        }
        
        if (impact) {
            impactDisplay.innerHTML = `<div class="alert alert-info mt-3"><i class="fas fa-heart me-2"></i>${impact}</div>`;
        }
    }

    // Notification function
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.donation-notification');
        existing.forEach(n => n.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} donation-notification position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
});