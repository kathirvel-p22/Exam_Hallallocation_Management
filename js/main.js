/**
 * Main JavaScript functionality for Exam Seat Allocation System
 */

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSmoothScrolling();
    initFormValidation();
    initTooltips();
    initScrollAnimations();
    initContactForm();
    initSystemStatus();
    
    console.log('Exam Seat Allocation System initialized');
});

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Form validation for contact form
 */
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            
            let isValid = true;
            const errors = [];
            
            // Validate name
            if (!name.value.trim()) {
                isValid = false;
                errors.push('Please enter your name');
                name.classList.add('is-invalid');
            } else {
                name.classList.remove('is-invalid');
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim() || !emailRegex.test(email.value)) {
                isValid = false;
                errors.push('Please enter a valid email address');
                email.classList.add('is-invalid');
            } else {
                email.classList.remove('is-invalid');
            }
            
            // Validate subject
            if (!subject.value.trim()) {
                isValid = false;
                errors.push('Please enter a subject');
                subject.classList.add('is-invalid');
            } else {
                subject.classList.remove('is-invalid');
            }
            
            // Validate message
            if (!message.value.trim() || message.value.length < 10) {
                isValid = false;
                errors.push('Message must be at least 10 characters long');
                message.classList.add('is-invalid');
            } else {
                message.classList.remove('is-invalid');
            }
            
            if (!isValid) {
                e.preventDefault();
                showFormErrors(errors);
            }
        });
    }
}

/**
 * Show form validation errors
 */
function showFormErrors(errors) {
    // Remove existing error alerts
    const existingAlerts = document.querySelectorAll('.alert-danger');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create error alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        <strong>Please fix the following errors:</strong>
        <ul class="mb-0 mt-2">
            ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert alert before the form
    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(alertDiv, form);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Scroll animations for elements
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with fade-in class
    const fadeElements = document.querySelectorAll('.feature-card, .stat-card, .metric-card, .status-card');
    fadeElements.forEach(el => observer.observe(el));
}

/**
 * Contact form submission handler
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    showSuccessMessage('Message sent successfully! We will get back to you soon.');
                    contactForm.reset();
                } else {
                    // Show error message
                    showErrorMessage(result.message || 'Failed to send message. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                showErrorMessage('An error occurred. Please try again later.');
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    showMessage(message, 'danger');
}

/**
 * Generic message display function
 */
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.alert');
    existingMessages.forEach(msg => msg.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at top of page
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

/**
 * System status monitoring
 */
function initSystemStatus() {
    // Update system time
    const timeElement = document.querySelector('.stat-content h3');
    if (timeElement) {
        setInterval(() => {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString();
        }, 1000);
    }
    
    // Animate metric bars
    const metricBars = document.querySelectorAll('.metric-fill');
    metricBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
    
    // Update status cards with live data
    updateStatusCards();
    setInterval(updateStatusCards, 30000); // Update every 30 seconds
}

/**
 * Update status cards with live data
 */
async function updateStatusCards() {
    try {
        const response = await fetch('../api/status.php');
        if (response.ok) {
            const data = await response.json();
            
            // Update status indicators
            updateStatusIndicator('server_status', data.server_status);
            updateStatusIndicator('database_status', data.database_status);
        }
    } catch (error) {
        console.warn('Could not fetch live status data:', error);
    }
}

/**
 * Update status indicator
 */
function updateStatusIndicator(elementId, status) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = status;
        
        const icon = element.closest('.status-card').querySelector('.status-icon');
        if (icon) {
            icon.className = 'status-icon ' + (status === 'Online' ? 'online' : 'error');
        }
    }
}

/**
 * Utility functions
 */

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add event listener for window resize with debounce
window.addEventListener('resize', debounce(function() {
    // Handle responsive changes
    console.log('Window resized');
}, 250));

// Add event listener for scroll with debounce
window.addEventListener('scroll', debounce(function() {
    // Handle scroll events
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}, 10));

// Add CSS for scrolled navbar
const style = document.createElement('style');
style.textContent = `
    .navbar.scrolled {
        background-color: rgba(0, 0, 0, 0.95) !important;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);