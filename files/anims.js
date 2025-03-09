// Add animation trigger when buttons are clicked
document.querySelectorAll('.button-container button').forEach(button => {
    button.addEventListener('click', function() {
        this.classList.add('animating');
        setTimeout(() => {
            this.classList.remove('animating');
        }, 600); // Match longest animation duration
    });
});
