/**
 * Admin Dashboard JavaScript Functions
 * Provides enhanced functionality for the admin interface
 */

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminFeatures();
    setupEventListeners();
});

/**
 * Initialize admin-specific features
 */
function initializeAdminFeatures() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize modals
    initializeModals();
    
    // Setup form validation
    setupFormValidation();
    
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
    
    // Setup auto-refresh for dashboard stats
    setupAutoRefresh();
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize modal behaviors
 */
function initializeModals() {
    // Setup modal backdrop for better UX
    var modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
        modal.addEventListener('show.bs.modal', function() {
            document.body.style.paddingRight = '0px'; // Fix scrollbar issue
        });
    });
}

/**
 * Setup form validation
 */
function setupFormValidation() {
    // Add real-time validation for forms
    var forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
    
    // Add input validation listeners
    var inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            clearInputError(this);
        });
    });
}

/**
 * Validate entire form
 */
function validateForm(form) {
    var inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    var isValid = true;
    
    inputs.forEach(function(input) {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Validate individual input
 */
function validateInput(input) {
    var value = input.value.trim();
    var isValid = true;
    
    // Remove existing error classes
    input.classList.remove('is-invalid');
    input.classList.remove('is-valid');
    
    // Check if required field is empty
    if (input.hasAttribute('required') && value === '') {
        showInputError(input, 'This field is required');
        isValid = false;
    } else if (input.type === 'email' && value !== '' && !isValidEmail(value)) {
        showInputError(input, 'Please enter a valid email address');
        isValid = false;
    } else if (input.type === 'number' && input.min && parseInt(value) < parseInt(input.min)) {
        showInputError(input, 'Value must be at least ' + input.min);
        isValid = false;
    } else if (input.type === 'number' && input.max && parseInt(value) > parseInt(input.max)) {
        showInputError(input, 'Value must not exceed ' + input.max);
        isValid = false;
    } else {
        input.classList.add('is-valid');
    }
    
    return isValid;
}

/**
 * Show input error
 */
function showInputError(input, message) {
    input.classList.add('is-invalid');
    
    // Remove existing error message
    var existingError = input.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message
    var errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
}

/**
 * Clear input error
 */
function clearInputError(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    var errorDiv = input.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Check if email is valid
 */
function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Setup event listeners for admin actions
 */
function setupEventListeners() {
    // Confirm delete actions
    var deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    });
    
    // Bulk actions
    var selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            var checkboxes = document.querySelectorAll('input[name="selected_items[]"]');
            checkboxes.forEach(function(checkbox) {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
    
    // Search functionality
    var searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(function(input) {
        input.addEventListener('keyup', function() {
            performSearch(this.value);
        });
    });
    
    // Export functionality
    var exportButtons = document.querySelectorAll('[data-export]');
    exportButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var format = this.getAttribute('data-export');
            var selectedItems = getSelectedItems();
            exportData(format, selectedItems);
        });
    });
}

/**
 * Perform search on table data
 */
function performSearch(query) {
    var tables = document.querySelectorAll('.table');
    tables.forEach(function(table) {
        var rows = table.querySelectorAll('tbody tr');
        rows.forEach(function(row) {
            var text = row.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

/**
 * Get selected items from checkboxes
 */
function getSelectedItems() {
    var checkboxes = document.querySelectorAll('input[name="selected_items[]"]:checked');
    var selected = [];
    checkboxes.forEach(function(checkbox) {
        selected.push(checkbox.value);
    });
    return selected;
}

/**
 * Export data in specified format
 */
function exportData(format, selectedItems) {
    // This would typically make an AJAX request to the server
    // For now, we'll show a message
    alert('Exporting ' + selectedItems.length + ' items in ' + format + ' format');
}

/**
 * Initialize charts (if Chart.js is available)
 */
function initializeCharts() {
    // Example chart initialization
    var ctx = document.getElementById('dashboard-chart');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Allocated', 'Available', 'Maintenance'],
                datasets: [{
                    data: [60, 30, 10],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

/**
 * Setup auto-refresh for dashboard stats
 */
function setupAutoRefresh() {
    // Only refresh if we're on the dashboard page
    if (window.location.pathname.includes('dashboard.php')) {
        setInterval(function() {
            // In a real application, this would make an AJAX request
            // to update stats without reloading the page
            console.log('Auto-refreshing dashboard stats...');
        }, 30000); // Refresh every 30 seconds
    }
}

/**
 * Show loading spinner
 */
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

/**
 * Hide loading spinner
 */
function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
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
 * Show general message
 */
function showMessage(message, type) {
    var alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-' + type + ' alert-dismissible fade show';
    alertDiv.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    
    var container = document.querySelector('.container-fluid');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(function() {
            alertDiv.remove();
        }, 5000);
    }
}

/**
 * Confirm action with custom message
 */
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Format number with commas
 */
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        var textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
    }
}

/**
 * Debounce function for search and other operations
 */
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

/**
 * Utility function to make AJAX requests
 */
function makeRequest(url, method = 'GET', data = null) {
    return fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: data ? JSON.stringify(data) : null
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    });
}

// Export functions for global use if needed
window.AdminJS = {
    showLoading: showLoading,
    hideLoading: hideLoading,
    showSuccessMessage: showSuccessMessage,
    showErrorMessage: showErrorMessage,
    confirmAction: confirmAction,
    formatDate: formatDate,
    formatNumber: formatNumber,
    copyToClipboard: copyToClipboard,
    debounce: debounce,
    makeRequest: makeRequest
};