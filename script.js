(() => {
  const monthYearEl = document.getElementById('monthYear');
  const daysEl = document.getElementById('days');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const todayBtn = document.getElementById('todayBtn');

  if (!monthYearEl || !daysEl || !prevBtn || !nextBtn || !todayBtn) {
    return;
  }

  const today = new Date();
  const state = { year: today.getFullYear(), month: today.getMonth() };

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
        const prevSel = daysEl.querySelector('.day.selected');
        if (prevSel) prevSel.classList.remove('selected');
        cell.classList.add('selected');
      });

      frag.appendChild(cell);
    });

    daysEl.appendChild(frag);
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
  }

  init();
})();






