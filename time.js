document.getElementById('toggleTimeFormat').addEventListener('click', function() {
    const timeElements = document.querySelectorAll('.time-column div');
    
    timeElements.forEach(function(element) {
        element.classList.remove('flipping'); 
        void element.offsetWidth; // Force reflow to restart animation
        element.classList.add('flipping');

        setTimeout(() => {
            let timeText = element.textContent;
            let [hours, minutes] = timeText.split('h');

            if (timeText.includes('h')) { 
                hours = parseInt(hours, 10);
                let period = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                element.textContent = `${hours}:${minutes} ${period}`;
            } else { 
                let [time, period] = timeText.split(' ');
                [hours, minutes] = time.split(':');
                hours = period === 'PM' && hours !== '12' ? parseInt(hours, 10) + 12 : hours;
                hours = period === 'AM' && hours === '12' ? '00' : hours;
                element.textContent = `${hours}h${minutes}`;
            }
        }, 300); // Delay text update until halfway through animation
    });
});
