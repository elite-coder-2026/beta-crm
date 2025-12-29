/**
 * Full Calendar Application
 * Includes month view with events, meeting management, and navigation
 */

class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.currentView = 'month';
        this.events = {};

        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSampleEvents();
        this.render();
    }

    cacheElements() {
        this.elements = {
            calendarGrid: document.getElementById('calendarGrid'),
            currentMonthYear: document.getElementById('currentMonthYear'),
            prevMonth: document.getElementById('prevMonth'),
            nextMonth: document.getElementById('nextMonth'),
            todayBtn: document.getElementById('todayBtn'),
            viewBtns: document.querySelectorAll('.view-btn')
        };
    }

    bindEvents() {
        // Navigation buttons
        this.elements.prevMonth.addEventListener('click', () => this.changeMonth(-1));
        this.elements.nextMonth.addEventListener('click', () => this.changeMonth(1));
        this.elements.todayBtn.addEventListener('click', () => this.goToToday());

        // View switcher buttons
        this.elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });
    }

    render() {
        this.renderHeader();
        this.renderCalendarGrid();
    }

    renderHeader() {
        const month = this.monthNames[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        this.elements.currentMonthYear.textContent = `${month} ${year}`;
    }

    renderCalendarGrid() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // First and last day of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Starting day of week (0 = Sunday)
        const startingDayOfWeek = firstDay.getDay();

        // Total days in month
        const daysInMonth = lastDay.getDate();

        // Days from previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        // Clear grid
        this.elements.calendarGrid.innerHTML = '';

        // Add days from previous month
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            const date = new Date(year, month - 1, dayNum);
            this.createDayCell(dayNum, date, true);
        }

        // Add days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            this.createDayCell(day, date, false);
        }

        // Add days from next month to complete grid
        const totalCells = this.elements.calendarGrid.children.length;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(year, month + 1, day);
            this.createDayCell(day, date, true);
        }
    }

    createDayCell(dayNum, date, isOtherMonth) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');

        if (isOtherMonth) {
            dayCell.classList.add('other-month');
        }

        // Check if today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (this.isSameDay(date, today)) {
            dayCell.classList.add('today');
        }

        // Check if selected
        if (this.selectedDate && this.isSameDay(date, this.selectedDate)) {
            dayCell.classList.add('selected');
        }

        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = dayNum;
        dayCell.appendChild(dayNumber);

        // Events for this day
        const dateKey = this.formatDate(date);
        if (this.events[dateKey] && this.events[dateKey].length > 0) {
            const eventsContainer = document.createElement('div');
            eventsContainer.classList.add('day-events');

            // Show max 3 events
            const eventsToShow = this.events[dateKey].slice(0, 3);
            eventsToShow.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.classList.add('event');
                if (event.type) {
                    eventEl.classList.add(`event-${event.type}`);
                }
                eventEl.textContent = event.title;
                eventEl.title = `${event.time} - ${event.title}`;
                eventsContainer.appendChild(eventEl);
            });

            dayCell.appendChild(eventsContainer);
        }

        // Click handler
        dayCell.addEventListener('click', () => this.selectDate(date));

        this.elements.calendarGrid.appendChild(dayCell);
    }

    selectDate(date) {
        this.selectedDate = date;
        this.render();

        // Emit custom event
        const event = new CustomEvent('dateSelected', {
            detail: { date: date, events: this.events[this.formatDate(date)] || [] }
        });
        document.dispatchEvent(event);
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.render();
    }

    switchView(view) {
        this.currentView = view;

        // Update active button
        this.elements.viewBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            }
        });

        // For now, only month view is implemented
        if (view !== 'month') {
            console.log(`${view} view not yet implemented`);
        }
    }

    addEvent(date, eventData) {
        const dateKey = this.formatDate(date);
        if (!this.events[dateKey]) {
            this.events[dateKey] = [];
        }
        this.events[dateKey].push(eventData);
        this.render();
    }

    loadSampleEvents() {
        const today = new Date();

        // Today's events
        this.addEvent(today, {
            title: 'Team Standup',
            time: '10:00 AM',
            type: 'meeting'
        });

        this.addEvent(today, {
            title: 'Client Presentation',
            time: '2:00 PM',
            type: 'meeting'
        });

        // Tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        this.addEvent(tomorrow, {
            title: 'Code Review',
            time: '11:00 AM',
            type: 'task'
        });

        // In 3 days
        const threeDays = new Date(today);
        threeDays.setDate(today.getDate() + 3);
        this.addEvent(threeDays, {
            title: 'Sprint Planning',
            time: '9:00 AM',
            type: 'meeting'
        });

        // In 5 days
        const fiveDays = new Date(today);
        fiveDays.setDate(today.getDate() + 5);
        this.addEvent(fiveDays, {
            title: 'Design Review',
            time: '4:30 PM',
            type: 'meeting'
        });

        this.addEvent(fiveDays, {
            title: 'Update Documentation',
            time: '1:00 PM',
            type: 'task'
        });

        // In 7 days
        const sevenDays = new Date(today);
        sevenDays.setDate(today.getDate() + 7);
        this.addEvent(sevenDays, {
            title: 'Team Lunch',
            time: '12:00 PM',
            type: 'meeting'
        });

        // In 10 days
        const tenDays = new Date(today);
        tenDays.setDate(today.getDate() + 10);
        this.addEvent(tenDays, {
            title: 'Project Deadline',
            time: '5:00 PM',
            type: 'task'
        });

        // In 14 days
        const fourteenDays = new Date(today);
        fourteenDays.setDate(today.getDate() + 14);
        this.addEvent(fourteenDays, {
            title: 'Quarterly Review',
            time: '3:00 PM',
            type: 'meeting'
        });
    }

    // Helper methods
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// Initialize calendar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new CalendarApp();

    // Listen for date selection events
    document.addEventListener('dateSelected', (e) => {
        console.log('Date selected:', e.detail.date);
        console.log('Events on this date:', e.detail.events);
    });

    // Make calendar accessible globally
    window.calendar = calendar;
});
