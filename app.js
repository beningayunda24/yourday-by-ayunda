// Variabel global untuk aplikasi
let entries = JSON.parse(localStorage.getItem('yourday_entries')) || [];
let currentEditId = null;
let currentDeleteId = null;
let currentFilter = 'all';
let isDarkMode = localStorage.getItem('yourday_darkmode') === 'true';
let previousActiveElement = null;

// Elemen DOM
const entryForm = document.getElementById('entry-form');
const entryDate = document.getElementById('entry-date');
const entryTitle = document.getElementById('entry-title');
const entryMood = document.getElementById('entry-mood');
const entryTags = document.getElementById('entry-tags');
const entryContent = document.getElementById('entry-content');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const entriesContainer = document.getElementById('entries-container');
const filterButtons = document.querySelectorAll('.filter-btn');
const deleteModal = document.getElementById('delete-modal');
const closeModal = document.getElementById('close-modal');
const cancelDelete = document.getElementById('cancel-delete');
const confirmDelete = document.getElementById('confirm-delete');
const totalEntriesEl = document.getElementById('total-entries');
const todayEntriesEl = document.getElementById('today-entries');
const avgMoodEl = document.getElementById('avg-mood');

// Elemen Dark Mode (tombol bulan)
const moonButton = document.getElementById('moon-button');
const body = document.body;

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
function getToday() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split('T')[0];
}

function getTodayFromDate(date) {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date - offset).toISOString().split('T')[0];
}

// Inisialisasi aplikasi
function init() {
    // Inisialisasi dark mode
    initDarkMode();

    // Set tanggal hari ini
    if (entryDate) {
        entryDate.value = getToday();
    }

    let changed = false;
    entries.forEach(entry => {
        if (!entry.date) {
            entry.date = getToday();
            changed = true;
        }
    });

    if (changed) {
        localStorage.setItem('yourday_entries', JSON.stringify(entries));
    }

    renderEntries();
    updateStats();
    setupEventListeners();
    setupMoodSelector();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    if (entryForm) {
        entryForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Cancel edit
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderEntries();
        });
    });
    
    // Modal events
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            const deleteModal = document.getElementById('delete-modal');
            if (deleteModal) {
                hideModal(deleteModal);
            }
        });
    }
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => {
            const deleteModal = document.getElementById('delete-modal');
            if (deleteModal) {
                hideModal(deleteModal);
            }
        });
    }
    
    if (confirmDelete) {
        confirmDelete.addEventListener('click', deleteEntry);
    }
    
    // Tombol bulan untuk dark mode
    if (moonButton) {
        moonButton.addEventListener('click', toggleDarkMode);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const deleteModal = document.getElementById('delete-modal');
        if (deleteModal && e.target === deleteModal) {
            hideModal(deleteModal);
        }
    });
}

// Setup mood selector
function setupMoodSelector() {
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            moodOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            option.classList.add('active');
            
            // Set hidden input value
            const mood = option.dataset.mood;
            entryMood.value = mood;
        });
    });
    
    // Set default active mood
    const defaultMoodOption = document.querySelector('.mood-option[data-mood="😊"]');
    if (defaultMoodOption) {
        defaultMoodOption.classList.add('active');
    }
}

// =============== MODAL FUNCTIONS ===============

// Show modal dengan aksesibilitas yang benar
function showModal(modalElement) {
    // Simpan elemen yang sedang aktif sebelum modal dibuka
    previousActiveElement = document.activeElement;
    
    // Tampilkan modal
    modalElement.style.display = 'flex';
    
    // Nonaktifkan scroll pada body
    document.body.style.overflow = 'hidden';
    
    // Focus trap: arahkan fokus ke tombol pertama di modal
    const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
        focusableElements[0].focus();
    }
    
    // Tambahkan event listener untuk trap fokus
    modalElement.addEventListener('keydown', trapFocus);
}

// Hide modal dengan aksesibilitas yang benar
function hideModal(modalElement) {
    // Sembunyikan modal
    modalElement.style.display = 'none';
    
    // Aktifkan kembali scroll pada body
    document.body.style.overflow = '';
    
    // Hapus event listener
    modalElement.removeEventListener('keydown', trapFocus);
    
    // Kembalikan fokus ke elemen sebelumnya
    if (previousActiveElement) {
        previousActiveElement.focus();
    }
}

// Focus trap untuk menjaga fokus tetap di dalam modal
function trapFocus(event) {
    const modal = document.getElementById('delete-modal');
    if (!modal) return;
    
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Jika menekan Tab
    if (event.key === 'Tab') {
        // Jika shift + tab pada elemen pertama, fokus ke elemen terakhir
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
        // Jika tab pada elemen terakhir, fokus ke elemen pertama
        else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
    
    // Jika menekan Escape, tutup modal
    if (event.key === 'Escape') {
        hideModal(modal);
    }
}

// Show delete confirmation (diperbaiki)
function showDeleteConfirmation(id) {
    currentDeleteId = id;
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        showModal(deleteModal);
    }
}

// Delete entry
function deleteEntry() {
    if (!currentDeleteId) return;
    
    // Remove entry from array
    entries = entries.filter(entry => entry.id !== currentDeleteId);
    
    // Save to localStorage
    localStorage.setItem('yourday_entries', JSON.stringify(entries));
    
    // Update UI
    renderEntries();
    updateStats();
    
    // Close modal
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        hideModal(deleteModal);
    }
    
    // Reset delete ID
    currentDeleteId = null;
    
    // Show notification
    showNotification('Catatan berhasil dihapus!', 'warning');
}

// ===================== DARK MODE FUNCTIONS =====================

// Inisialisasi dark mode
function initDarkMode() {
    // Set initial state
    if (isDarkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    
    // Update tombol bulan
    updateMoonButton();
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    
    // Save preference to localStorage
    localStorage.setItem('yourday_darkmode', isDarkMode);
    
    // Update tombol bulan
    updateMoonButton();
    
    // Animasi klik pada tombol bulan
    animateMoonButton();
    
    // Show notification
    const modeText = isDarkMode ? 'Mode Gelap' : 'Mode Terang';
    showNotification(`Diubah ke ${modeText}`, 'success');
}

// Enable dark mode
function enableDarkMode() {
    body.classList.add('dark-mode');
}

// Disable dark mode
function disableDarkMode() {
    body.classList.remove('dark-mode');
}

// Update tombol bulan berdasarkan mode
function updateMoonButton() {
    if (!moonButton) return;
    
    const moonIcon = moonButton.querySelector('i');
    if (moonIcon) {
        if (isDarkMode) {
            moonIcon.className = 'fas fa-sun';
            moonButton.title = 'Switch to Light Mode';
            moonButton.setAttribute('aria-label', 'Switch to Light Mode');
        } else {
            moonIcon.className = 'fas fa-moon';
            moonButton.title = 'Switch to Dark Mode';
            moonButton.setAttribute('aria-label', 'Switch to Dark Mode');
        }
    }
}

// Animasi untuk tombol bulan saat diklik
function animateMoonButton() {
    if (!moonButton) return;
    
    // Reset animation
    moonButton.style.animation = 'none';
    
    // Trigger reflow
    void moonButton.offsetWidth;
    
    // Add animation
    moonButton.style.animation = 'moonPulse 0.5s ease';
    
    // Hapus animation setelah selesai
    setTimeout(() => {
        moonButton.style.animation = '';
    }, 500);
}

// ===================== JOURNAL FUNCTIONS =====================

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const entry = {
        id: currentEditId || Date.now().toString(),
        date: entryDate.value,
        title: entryTitle.value,
        mood: entryMood.value,
        tags: entryTags.value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        content: entryContent.value,
        createdAt: currentEditId ? entries.find(entry => entry.id === currentEditId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (currentEditId) {
        // Update existing entry
        const index = entries.findIndex(e => e.id === currentEditId);
        if (index !== -1) {
            entries[index] = entry;
            showNotification('Catatan berhasil diperbarui!', 'success');
        }
    } else {
        // Add new entry
        entries.unshift(entry);
        showNotification('Catatan baru berhasil ditambahkan!', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('yourday_entries', JSON.stringify(entries));
    
    // Reset form
    resetForm();
    
    // Update UI
    renderEntries();
    updateStats();
}

// Reset form
function resetForm() {
    if (entryForm) {
        entryForm.reset();
        entryDate.value = getToday(); // Menggunakan fungsi getToday()
        entryMood.value = '😊';
        
        // Reset mood selector
        document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('active'));
        const defaultMoodOption = document.querySelector('.mood-option[data-mood="😊"]');
        if (defaultMoodOption) {
            defaultMoodOption.classList.add('active');
        }
        
        // Hide cancel button
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Catatan';
        
        // Reset edit ID
        currentEditId = null;
    }
}

// Cancel edit mode
function cancelEdit() {
    resetForm();
}

// Edit entry
function editEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    
    // Fill form with entry data
    entryDate.value = entry.date;
    entryTitle.value = entry.title;
    entryMood.value = entry.mood;
    entryTags.value = entry.tags.join(', ');
    entryContent.value = entry.content;
    
    // Set active mood
    document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('active'));
    const moodOption = document.querySelector(`.mood-option[data-mood="${entry.mood}"]`);
    if (moodOption) {
        moodOption.classList.add('active');
    }
    
    // Change button text
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-edit"></i> Perbarui Catatan';
    if (cancelBtn) cancelBtn.style.display = 'flex';
    
    // Set current edit ID
    currentEditId = id;
    
    // Scroll to form
    const leftColumn = document.querySelector('.left-column');
    if (leftColumn) {
        leftColumn.scrollIntoView({ behavior: 'smooth' });
    }
}


// Render entries based on filter
function renderEntries() {
    if (!entriesContainer) return;
    
    // Filter entries
    let filteredEntries = [...entries];
    const today = getToday(); // Menggunakan fungsi getToday()
    
    // Hitung tanggal 7 hari yang lalu
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
    
    if (currentFilter === 'today') {
        filteredEntries = filteredEntries.filter(entry => entry.date === today);
    } else if (currentFilter === 'week') {
        filteredEntries = filteredEntries.filter(entry => entry.date >= oneWeekAgoStr);
    }
    
    // Sort by date (newest first)
    filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear container
    entriesContainer.innerHTML = '';
    
    // Check if no entries
    if (filteredEntries.length === 0) {
        let title = '';
        let message = '';
        if (currentFilter === 'today') {
            title = 'Belum ada journal untuk hari ini';
            message = '<p>Mulailah mengabadikan hari dan pikiranmu dengan bebas.</p>';
        } else if (currentFilter === 'week') {
            title = 'Belum ada journal dalam minggu ini';
            message = '<p>Mulailah mengabadikan hari dan pikiranmu dengan bebas.</p>';
        } else {
            title = 'Belum ada journal tersimpan';
            message = '<p>Mulailah mengabadikan hari dan pikiranmu dengan bebas.</p>';
        }
        
        entriesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
        return;
    }
    
    // Render entries
    filteredEntries.forEach(entry => {
        const entryEl = document.createElement('div');
        entryEl.className = 'entry-item';
        
        // Format date
        const dateObj = new Date(entry.date);
        const formattedDate = dateObj.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create tags HTML
        let tagsHtml = '';
        if (entry.tags && entry.tags.length > 0) {
            tagsHtml = '<div class="entry-tags">';
            entry.tags.forEach(tag => {
                tagsHtml += `<span class="tag">${tag}</span>`;
            });
            tagsHtml += '</div>';
        }
        
        // Truncate content for preview
        const contentPreview = entry.content.length > 150 
            ? entry.content.substring(0, 150) + '...' 
            : entry.content;
        
        entryEl.innerHTML = `
            <div class="entry-header">
                <div class="entry-date">${formattedDate}</div>
                <div class="entry-mood">${entry.mood}</div>
            </div>
            ${tagsHtml}
            <h3 class="entry-title">${entry.title}</h3>
            <p class="entry-content">${contentPreview}</p>
            <div class="entry-actions">
                <div class="action-btn edit-btn" onclick="editEntry('${entry.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </div>
                <div class="action-btn delete-btn" onclick="showDeleteConfirmation('${entry.id}')" title="Hapus">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
        
        entriesContainer.appendChild(entryEl);
    });
}

// Update statistics
function updateStats() {
    if (!totalEntriesEl || !todayEntriesEl || !avgMoodEl) return;
    
    // Total entries
    totalEntriesEl.textContent = entries.length;
    
    // Today's entries - menggunakan fungsi getToday()
    const today = getToday();
    const todayEntries = entries.filter(entry => entry.date === today).length;
    todayEntriesEl.textContent = todayEntries;
    
    // Average mood
    if (entries.length === 0) {
        avgMoodEl.textContent = '-';
        avgMoodEl.setAttribute('aria-label', 'Belum ada data mood');
        return;
    }
    const moodScores = {
            '😊': 5,
            '😐': 4,
            '😔': 2,
            '😡': 1,
            '😴': 3    
    };
    
    const totalScore = entries.reduce(
        (sum, entry) => sum + (moodScores[entry.mood] || 3),
        0
    );

    const avgScore = totalScore / entries.length;
        
    let avgMood = '😐';
    if (avgScore >= 4.5) avgMood = '😊';
    else if (avgScore >= 3.5) avgMood = '😐';
    else if (avgScore >= 2.5) avgMood = '😴';
    else if (avgScore >= 1.5) avgMood = '😔';
    else avgMood = '😡';    
    
    avgMoodEl.textContent = avgMood;
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' || type === 'warning' ? 'notification-error' : ''}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles for notification (with dark mode support)
    const bgColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);