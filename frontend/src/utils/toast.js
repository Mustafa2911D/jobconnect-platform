export const showToast = (message, type = 'success') => {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.custom-toast');
  existingToasts.forEach(toast => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  });

  // Constants
  const styles = {
    success: 'bg-gradient-to-r from-green-600 to-emerald-700 border-l-4 border-emerald-400 shadow-2xl',
    error: 'bg-gradient-to-r from-red-600 to-pink-700 border-l-4 border-red-400 shadow-2xl', 
    warning: 'bg-gradient-to-r from-yellow-600 to-orange-600 border-l-4 border-yellow-400 shadow-2xl',
    info: 'bg-gradient-to-r from-blue-600 to-cyan-700 border-l-4 border-blue-400 shadow-2xl'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: '💡'
  };

  // Create new toast
  const toast = document.createElement('div');
  toast.className = `custom-toast fixed top-6 right-6 ${styles[type]} text-white px-6 py-4 rounded-r-xl z-[9999] transform transition-all duration-500 translate-x-full flex items-center space-x-3 font-semibold text-sm min-w-[300px] max-w-md backdrop-blur-sm bg-opacity-95`;
  
  toast.innerHTML = `
    <span class="text-lg flex-shrink-0">${icons[type]}</span>
    <span class="flex-1">${message}</span>
    <button class="toast-close ml-2 text-white hover:text-gray-200 transition-colors flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  `;
  
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full');
    toast.classList.add('translate-x-0');
  });

  // Close button functionality
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 500);
  });

  // Auto remove after 4 seconds
  const autoRemove = setTimeout(() => {
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 500);
  }, 4000);

  // Allow manual close on click (except close button)
  toast.addEventListener('click', (e) => {
    if (!e.target.closest('.toast-close')) {
      clearTimeout(autoRemove);
      toast.classList.remove('translate-x-0');
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 500);
    }
  });
};