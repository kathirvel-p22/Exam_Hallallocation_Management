// Student Portal JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality
    initSearch();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize responsive navigation
    initResponsiveNav();
    
    // Add loading states for downloads
    initDownloadButtons();
});

// Search functionality for allocations
function initSearch() {
    const searchInput = document.getElementById('search');
    const allocationCards = document.querySelectorAll('.allocation-card');
    
    if (!searchInput || allocationCards.length === 0) return;
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        allocationCards.forEach(card => {
            const hallName = card.dataset.hallName || '';
            const hallNumber = card.dataset.hallNumber || '';
            
            const matches = hallName.includes(searchTerm) || hallNumber.includes(searchTerm);
            
            if (matches) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Tooltip initialization
function initTooltips() {
    // Add tooltips to buttons with title attributes
    const tooltips = document.querySelectorAll('[title]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.title;
            this.title = '';
            this.appendChild(tooltip);
            
            // Position tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.top = (rect.height + 5) + 'px';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.tooltip');
            if (tooltip) {
                this.title = tooltip.textContent;
                tooltip.remove();
            }
        });
    });
}

// Responsive navigation
function initResponsiveNav() {
    // Add mobile menu toggle if needed
    const header = document.querySelector('.student-header');
    if (!header) return;
    
    // Add active class to current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || 
            (link.getAttribute('href').includes('dashboard') && currentPath.includes('dashboard')) ||
            (link.getAttribute('href').includes('allocations') && currentPath.includes('allocations')) ||
            (link.getAttribute('href').includes('reports') && currentPath.includes('reports'))) {
            link.classList.add('active');
        }
    });
}

// Download functionality
function initDownloadButtons() {
    const downloadButtons = document.querySelectorAll('button[onclick*="downloadReport"]');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const originalText = this.textContent.trim();
            const originalIcon = icon.className;
            
            // Show loading state
            this.disabled = true;
            icon.className = 'fas fa-spinner fa-spin';
            this.textContent = ' Downloading...';
            
            // Simulate download delay
            setTimeout(() => {
                this.disabled = false;
                icon.className = originalIcon;
                this.textContent = originalText;
            }, 2000);
        });
    });
}

// Export to CSV functionality
function exportToCSV() {
    const cards = document.querySelectorAll('.allocation-card');
    if (cards.length === 0) {
        alert('No data to export.');
        return;
    }
    
    // Create CSV content
    let csvContent = "Hall Name,Hall Number,Capacity,Allocated Students,Utilization (%)\n";
    
    cards.forEach(card => {
        const hallName = card.querySelector('.card-header h3')?.textContent || '';
        const hallNumber = card.querySelector('.card-header p')?.textContent.replace('Hall No: ', '') || '';
        const capacity = card.querySelector('.stat:nth-child(1) .stat-value')?.textContent || '';
        const students = card.querySelector('.stat:nth-child(2) .stat-value')?.textContent || '';
        const utilization = card.querySelector('.stat:nth-child(3) .stat-value')?.textContent || '';
        
        csvContent += `"${hallName}","${hallNumber}","${capacity}","${students}","${utilization}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'department_allocations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    showNotification('CSV file downloaded successfully!', 'success');
}

// Download report function
function downloadReport(format, hallId = null) {
    const studentDept = document.querySelector('.page-subtitle')?.textContent.replace('Department: ', '') || '';
    const hallName = hallId ? document.querySelector(`.allocation-card[data-hall-id="${hallId}"] .card-header h3`)?.textContent : 'Department';
    
    let filename = '';
    if (hallId) {
        filename = `${studentDept}_${hallName.replace(/\s+/g, '_')}_report.${format}`;
    } else {
        filename = `${studentDept}_department_report.${format}`;
    }
    
    // Show loading state
    const buttons = document.querySelectorAll(`button[onclick*="downloadReport"]`);
    buttons.forEach(btn => {
        if (btn.onclick.toString().includes(hallId ? hallId.toString() : 'null')) {
            const icon = btn.querySelector('i');
            const originalText = btn.textContent.trim();
            const originalIcon = icon.className;
            
            btn.disabled = true;
            icon.className = 'fas fa-spinner fa-spin';
            btn.textContent = ' Downloading...';
            
            setTimeout(() => {
                btn.disabled = false;
                icon.className = originalIcon;
                btn.textContent = originalText;
                showNotification(`${format.toUpperCase()} report downloaded successfully!`, 'success');
            }, 2000);
        }
    });
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    
    // Set colors based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            notification.style.color = 'white';
            break;
        default:
            notification.style.backgroundColor = '#2563eb';
            notification.style.color = 'white';
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Utility function to format numbers
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

// Utility function to calculate percentage
function calculatePercentage(partialValue, totalValue) {
    return totalValue > 0 ? Math.round((partialValue / totalValue) * 100) : 0;
}

// Add CSS for animations and notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .notification {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .tooltip {
        position: absolute;
        background-color: #334155;
        color: white;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
    }
    
    .tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #334155 transparent transparent transparent;
    }
`;
document.head.appendChild(style);