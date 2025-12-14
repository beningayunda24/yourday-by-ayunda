// JavaScript untuk landing page (hanya animasi tambahan)
document.addEventListener('DOMContentLoaded', function() {
    // Tambahkan efek hover yang lebih smooth pada feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 20px 40px rgba(138, 92, 245, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--shadow)';
        });
    });
    
    // Animasi untuk tombol "Mulai Sekarang"
    const startButton = document.querySelector('.start-button');
    
    if (startButton) {
        startButton.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 30px rgba(138, 92, 245, 0.3)';
        });
        
        startButton.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--shadow)';
        });
    }
});