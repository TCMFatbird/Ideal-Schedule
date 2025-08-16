// Generate 1-hour-apart time slots and expose generateTimes()
function pad(n) { return n.toString().padStart(2, '0'); }

function formatHour(hour) { return `${pad(hour)}h00`; }

function generateTimes(startHour = 8) {
    const timeColumn = document.querySelector('.time-column');
    if (!timeColumn) return;
    // Determine number of slots based on table rows
    const table = document.querySelector('table');
    const rows = table ? table.tBodies[0].rows.length : 12;
    // Clear existing
    timeColumn.innerHTML = '';
    const tableRect = table.getBoundingClientRect();
    const rowHeight = tableRect.height / rows;
    for (let i = 0; i < rows; i++) {
        const hour = (startHour + i) % 24;
        const div = document.createElement('div');
        div.contentEditable = 'true';
        div.className = 'time-slot';
        div.textContent = formatHour(hour);
        div.title = 'Click to edit time';
        // position at the top edge of the row
        div.style.top = `${i * rowHeight}px`;
        timeColumn.appendChild(div);
    }

    // create (or recreate) separators overlay
    // remove old separators
    document.querySelectorAll('.separator').forEach(s => s.remove());
    const scheduleRect = document.querySelector('.schedule').getBoundingClientRect();
    // we'll add separators at specific row boundaries (example: after row 2,3 etc.)
    const separatorIndices = [2, 3, 6, 7]; // default indices used previously
    separatorIndices.forEach(idx => {
        if (idx > rows) return;
        const sep = document.createElement('div');
        sep.className = 'separator';
        // alternate color for visibility
        sep.classList.add(idx % 2 === 0 ? 'yellow' : 'green');
        sep.style.top = `${(idx) * rowHeight}px`;
        // add a small handle for dragging
        const handle = document.createElement('div');
        handle.className = 'handle';
        sep.appendChild(handle);
        document.querySelector('.schedule').appendChild(sep);

        // drag behavior
        let dragging = false;
        let startY = 0;

        handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            dragging = true;
            startY = e.clientY;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', function(e) {
            if (!dragging) return;
            const dy = e.clientY - startY;
            const newTop = (idx * rowHeight) + dy;
            // snap to nearest row top
            const nearestRow = Math.round(newTop / rowHeight);
            const clamped = Math.max(0, Math.min(rows, nearestRow));
            sep.style.top = `${clamped * rowHeight}px`;
        });

        document.addEventListener('mouseup', function(e) {
            if (!dragging) return;
            dragging = false;
            document.body.style.userSelect = '';
            // snap final
            const topPx = parseFloat(sep.style.top);
            const nearestRow = Math.round(topPx / rowHeight);
            sep.style.top = `${nearestRow * rowHeight}px`;
        });
    });
}

// Expose to window so timetable.js can call it
window.generateTimes = generateTimes;

// Toggle format button keeps previous behavior but works with editable slots
document.getElementById('toggleTimeFormat').addEventListener('click', function() {
    const timeElements = document.querySelectorAll('.time-column .time-slot');
    timeElements.forEach(function(element) {
        element.classList.remove('flipping');
        void element.offsetWidth;
        element.classList.add('flipping');

        setTimeout(() => {
            const timeText = element.textContent.trim();
            if (timeText.includes('h')) {
                let [hours, minutes] = timeText.split('h');
                hours = parseInt(hours, 10);
                let period = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                element.textContent = `${hours}:${minutes} ${period}`;
            } else {
                let [time, period] = timeText.split(' ');
                if (!time) return;
                let [hours, minutes] = time.split(':');
                hours = period === 'PM' && hours !== '12' ? parseInt(hours, 10) + 12 : hours;
                hours = period === 'AM' && hours === '12' ? '00' : hours;
                element.textContent = `${hours}h${minutes}`;
            }
        }, 300);
    });
});

// On load generate initial times
document.addEventListener('DOMContentLoaded', () => {
    generateTimes();
});
