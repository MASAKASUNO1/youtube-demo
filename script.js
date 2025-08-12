(() => {
  const monthYearEl = document.getElementById('monthYear');
  const daysEl = document.getElementById('days');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const todayBtn = document.getElementById('todayBtn');

  // Event UI elements
  const eventModal = document.getElementById('eventModal');
  const eventModalBackdrop = document.getElementById('eventModalBackdrop');
  const eventForm = document.getElementById('eventForm');
  const eventDateInput = document.getElementById('eventDate');
  const eventTitleInput = document.getElementById('eventTitle');
  const eventTimeInput = document.getElementById('eventTime');
  const eventCancelBtn = document.getElementById('eventCancel');
  const eventListEl = document.getElementById('eventList');
  const eventPanelTitle = document.getElementById('eventPanelTitle');
  const addEventBtn = document.getElementById('addEventBtn');

  if (!monthYearEl || !daysEl || !prevBtn || !nextBtn || !todayBtn) {
    return;
  }

  const today = new Date();
  const state = { year: today.getFullYear(), month: today.getMonth() };
  let selectedDate = null; // 'YYYY-MM-DD'

  // Storage helpers
  const STORAGE_KEY = 'calendar-events';
  function loadEvents() {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatDateYMD(y, m, d) {
    return `${y}-${pad(m + 1)}-${pad(d)}`;
  }

  function setMonthYearLabel(year, month) {
    const dtf = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long' });
    const label = dtf.format(new Date(year, month, 1));
    monthYearEl.textContent = label;
  }

  function openEventModal(dateStr) {
    if (!eventModal) return;
    eventModal.setAttribute('aria-hidden', 'false');
    eventModal.classList.add('open');
    if (eventDateInput) eventDateInput.value = dateStr;
    if (eventTitleInput) eventTitleInput.value = '';
    if (eventTimeInput) eventTimeInput.value = '';
    eventTitleInput && eventTitleInput.focus();
  }

  function closeEventModal() {
    if (!eventModal) return;
    eventModal.setAttribute('aria-hidden', 'true');
    eventModal.classList.remove('open');
  }

  function renderEventMarkers() {
    const events = loadEvents();
    const cells = daysEl.querySelectorAll('.day');
    cells.forEach((cell) => {
      cell.querySelectorAll('.event-dot, .event-count').forEach((el) => el.remove());
      const dateStr = cell.dataset.date;
      const list = events[dateStr] || [];
      if (list.length > 0) {
        const dot = document.createElement('span');
        dot.className = 'event-dot';
        cell.appendChild(dot);
        if (list.length > 1) {
          const count = document.createElement('span');
          count.className = 'event-count';
          count.textContent = String(list.length);
          cell.appendChild(count);
        }
      }
    });
  }

  function renderEventList(dateStr) {
    if (!eventListEl || !eventPanelTitle) return;
    const events = loadEvents();
    const list = events[dateStr] || [];
    eventPanelTitle.textContent = `${dateStr} の予定`;
    eventListEl.innerHTML = '';
    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'event-empty';
      empty.textContent = '予定はありません';
      eventListEl.appendChild(empty);
      return;
    }
    list
      .slice()
      .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
      .forEach((ev) => {
        const item = document.createElement('div');
        item.className = 'event-item';
        const meta = document.createElement('div');
        meta.className = 'event-meta';
        meta.textContent = ev.time ? `${ev.time}  ${ev.title}` : ev.title;
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'event-delete';
        del.textContent = '削除';
        del.addEventListener('click', () => {
          const all = loadEvents();
          const arr = all[dateStr] || [];
          const idx = arr.findIndex((x) => x.id === ev.id);
          if (idx >= 0) {
            arr.splice(idx, 1);
            all[dateStr] = arr;
            saveEvents(all);
            renderEventMarkers();
            renderEventList(dateStr);
          }
        });
        item.appendChild(meta);
        item.appendChild(del);
        eventListEl.appendChild(item);
      });
  }

  function selectDate(dateStr) {
    selectedDate = dateStr;
    const prevSel = daysEl.querySelector('.day.selected');
    if (prevSel) prevSel.classList.remove('selected');
    const cell = daysEl.querySelector(`.day[data-date="${dateStr}"]`);
    if (cell) cell.classList.add('selected');
    if (eventDateInput) eventDateInput.value = dateStr;
    renderEventList(dateStr);
  }

  function renderCalendar() {
    setMonthYearLabel(state.year, state.month);
    daysEl.innerHTML = '';

    const firstDayIdx = new Date(state.year, state.month, 1).getDay(); // 0=Sun..6=Sat
    const totalDays = daysInMonth(state.year, state.month);

    const prevMonth = state.month === 0 ? 11 : state.month - 1;
    const prevYear = state.month === 0 ? state.year - 1 : state.year;
    const prevMonthDays = daysInMonth(prevYear, prevMonth);

    const cells = [];

    for (let i = firstDayIdx - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const dateStr = formatDateYMD(prevYear, prevMonth, dayNum);
      cells.push({ day: dayNum, dateStr, other: true });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = formatDateYMD(state.year, state.month, d);
      cells.push({ day: d, dateStr, other: false });
    }

    const remaining = 42 - cells.length;
    const nextMonth = state.month === 11 ? 0 : state.month + 1;
    const nextYear = state.month === 11 ? state.year + 1 : state.year;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = formatDateYMD(nextYear, nextMonth, d);
      cells.push({ day: d, dateStr, other: true });
    }

    const isCurrentMonthVisible =
      state.year === today.getFullYear() && state.month === today.getMonth();

    const frag = document.createDocumentFragment();

    cells.forEach(({ day, dateStr, other }) => {
      const cell = document.createElement('div');
      cell.className = 'day' + (other ? ' other-month' : '');
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('tabindex', '0');
      cell.dataset.date = dateStr;
      cell.textContent = String(day);

      if (isCurrentMonthVisible && !other && day === today.getDate()) {
        cell.classList.add('today');
      }

      cell.addEventListener('click', () => {
        selectDate(dateStr);
      });

      frag.appendChild(cell);
    });

    daysEl.appendChild(frag);

    if (selectedDate) {
      const sel = daysEl.querySelector(`.day[data-date="${selectedDate}"]`);
      if (sel) sel.classList.add('selected');
    }
    renderEventMarkers();
  }

  function prevMonth() {
    if (state.month === 0) {
      state.month = 11;
      state.year -= 1;
    } else {
      state.month -= 1;
    }
    renderCalendar();
  }

  function nextMonth() {
    if (state.month === 11) {
      state.month = 0;
      state.year += 1;
    } else {
      state.month += 1;
    }
    renderCalendar();
  }

  function goToToday() {
    state.year = today.getFullYear();
    state.month = today.getMonth();
    renderCalendar();
    const d = formatDateYMD(today.getFullYear(), today.getMonth(), today.getDate());
    selectDate(d);
  }

  function init() {
    prevBtn.addEventListener('click', prevMonth);
    nextBtn.addEventListener('click', nextMonth);
    todayBtn.addEventListener('click', goToToday);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevMonth();
      else if (e.key === 'ArrowRight') nextMonth();
      else if (e.key.toLowerCase() === 't') goToToday();
    });

    renderCalendar();

    // initial select today
    const d = formatDateYMD(today.getFullYear(), today.getMonth(), today.getDate());
    selectDate(d);

    // Modal wiring
    eventCancelBtn && eventCancelBtn.addEventListener('click', closeEventModal);
    eventModalBackdrop && eventModalBackdrop.addEventListener('click', closeEventModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeEventModal(); });

    eventForm && eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = eventTitleInput ? eventTitleInput.value.trim() : '';
      if (!title) return;
      const date = (eventDateInput && eventDateInput.value) || selectedDate;
      if (!date) return;
      const ev = { id: Date.now().toString(), title, time: eventTimeInput ? (eventTimeInput.value || undefined) : undefined };
      const all = loadEvents();
      all[date] = all[date] || [];
      all[date].push(ev);
      saveEvents(all);
      closeEventModal();
      renderEventMarkers();
      renderEventList(date);
    });

    addEventBtn && addEventBtn.addEventListener('click', () => {
      const date = selectedDate || d;
      selectDate(date);
      openEventModal(date);
    });
  }

  init();
})();
