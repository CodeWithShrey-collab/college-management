import {
  initFirebaseSession,
  getCurrentSession,
  signUpAccount,
  signInAccount,
  logoutAccount,
  getOverview,
  getStudents,
  registerStudent,
  removeStudent,
  getFaculty,
  registerFaculty,
  removeFaculty,
  recordAttendance,
  uploadMarks,
  getTimetable,
  addClassSchedule,
  addLabSchedule,
  getExams,
  createExam,
  getResults,
  getFeeSummary,
  payFee,
  getNotices,
  addNotice,
  getCommunications,
  addEvent,
  getLibraryBooks,
  addLibraryBook,
  issueBook,
  returnBook,
  getAdminAnalytics,
  chatbot
} from '/firebase-backend.js';

const page = document.body.dataset.page || 'dashboard';
const GPTOSS_MODEL = 'gpt-oss-20b';
const GPTOSS_BASE_URL_KEY = 'auroraGptOssBaseUrl';
const GPTOSS_THREAD_KEY = 'auroraGptOssThreadId';

const pages = [
  { key: 'dashboard', href: '/', label: 'Dashboard', hint: 'Campus overview' },
  { key: 'students', href: '/students.html', label: 'Students', hint: 'Registry and academic status' },
  { key: 'faculty', href: '/faculty.html', label: 'Faculty', hint: 'Access and teaching allocation' },
  { key: 'schedule', href: '/schedule.html', label: 'Schedule', hint: 'Classes, labs, and exams' },
  { key: 'exams', href: '/exams.html', label: 'Exams', hint: 'Assessment planning' },
  { key: 'fees', href: '/fees.html', label: 'Fees', hint: 'Payments and receipts' },
  { key: 'notices', href: '/notices.html', label: 'Notices', hint: 'Announcements and events' },
  { key: 'library', href: '/library.html', label: 'Library', hint: 'Circulation and fines' },
  { key: 'admin', href: '/admin.html', label: 'Admin', hint: 'Analytics and control' },
  { key: 'assistant', href: '/assistant.html', label: 'AI Assistant', hint: 'Student help desk' }
];

const icons = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h8V3H3z"/><path d="M13 21h8v-6h-8z"/><path d="M13 10h8V3h-8z"/><path d="M3 21h8v-4H3z"/></svg>',
  students: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  faculty: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22 10-10-5L2 10l10 5 10-5Z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/></svg>',
  schedule: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  exams: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16l4-3 4 3 4-3 4 3V8z"/><path d="M14 2v6h6"/></svg>',
  fees: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5h10"/><path d="M7 9h9"/><path d="M7 5c4.8 0 7 1.7 7 4.5S11.8 14 7 14"/><path d="M10 14l6 5"/></svg>',
  notices: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M4 11h16l-1 9H5z"/><path d="M10 15h4"/></svg>',
  library: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
  admin: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-6"/><path d="M18 20V10"/><path d="M6 20v-3"/><path d="M3 3h18v4H3z"/></svg>',
  assistant: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8v4a3 3 0 0 0 3 3h2l2 3 2-3h4a3 3 0 0 0 3-3v-4a8 8 0 0 0-8-8Z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z"/><path d="M9.5 12.5 11 14l3.5-4"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
};

let attendanceChart = null;

const api = {
  overview: () => getOverview(),
  students: () => getStudents(),
  registerStudent: (body) => registerStudent(body),
  removeStudent: (studentId) => removeStudent(studentId),
  faculty: () => getFaculty(),
  registerFaculty: (body) => registerFaculty(body),
  removeFaculty: (facultyId) => removeFaculty(facultyId),
  attendance: (body) => recordAttendance(body),
  marks: (body) => uploadMarks(body),
  timetable: () => getTimetable(),
  addClass: (body) => addClassSchedule(body),
  addLab: (body) => addLabSchedule(body),
  exams: () => getExams(),
  createExam: (body) => createExam(body),
  reportCard: (studentId) => getResults(studentId),
  fees: () => getFeeSummary(),
  payFee: (body) => payFee(body),
  notices: () => getNotices(),
  addNotice: (body) => addNotice(body),
  communications: () => getCommunications(),
  addEvent: (body) => addEvent(body),
  library: () => getLibraryBooks(),
  addBook: (body) => addLibraryBook(body),
  issueBook: (body) => issueBook(body),
  returnBook: (body) => returnBook(body),
  analytics: () => getAdminAnalytics(),
  askAi: (body) => chatbot(body)
};

document.addEventListener('DOMContentLoaded', async () => {
  await initFirebaseSession();
  await injectShell();
  await initializePage();
  applyRoleAccess();
});

window.addEventListener('aurora:session-change', async () => {
  await injectShell();
  applyRoleAccess();
  if (page === 'faculty') {
    updateAuthExperience();
  }
});

async function injectShell() {
  const sidebarRoot = document.getElementById('sidebar-root');
  const topbarRoot = document.getElementById('topbar-root');
  const title = document.body.dataset.title || 'Aurora Campus ERP';
  const pageLabel = pages.find((item) => item.key === page)?.label || 'Module';
  const shellState = await getShellState();
  const avatar = initials(shellState.name);

  sidebarRoot.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand-mark">${icons.shield}</div>
      <div>
        <p class="caps-label">Campus OS</p>
        <h2>Aurora ERP</h2>
      </div>
    </div>
    <nav class="sidebar-nav">
      ${pages.map((item) => `
        <a class="sidebar-link ${page === item.key ? 'active' : ''}" href="${item.href}" title="${escapeHtml(item.hint)}">
          ${icons[item.key] || ''}
          <span>${escapeHtml(item.label)}</span>
        </a>
      `).join('')}
    </nav>
    <button class="sidebar-profile" id="shell-sidebar-profile" type="button">
      <div class="sidebar-avatar">${escapeHtml(avatar)}</div>
      <div class="sidebar-profile-meta">
        <strong>${escapeHtml(shellState.name)}</strong>
        <p class="caps-label">${escapeHtml(shellState.role)}</p>
      </div>
    </button>
  `;

  topbarRoot.innerHTML = `
    <div class="topbar-brandline">
      <span class="topbar-breadcrumb">Home / ${escapeHtml(pageLabel)}</span>
      <strong>${escapeHtml(title)}</strong>
    </div>
    <label class="search-shell" aria-label="Search modules">
      ${icons.search}
      <input class="search-input" id="global-search" type="search" placeholder="Search students, fees, exams...">
    </label>
    <div class="topbar-actions">
      <button class="icon-btn" id="shell-notifications" type="button" title="Notifications">
        ${icons.bell}
        <span class="topbar-alert-badge" id="notification-count">${escapeHtml(String(shellState.notificationCount))}</span>
      </button>
      <button class="topbar-user" id="shell-user-button" type="button">
        <div class="topbar-avatar">${escapeHtml(avatar)}</div>
        <div class="topbar-user-meta">
          <strong>${escapeHtml(shellState.name)}</strong>
          <span>${escapeHtml(shellState.role)}</span>
        </div>
        <span class="topbar-chevron">${icons.chevronDown}</span>
      </button>
    </div>
  `;

  bindGlobalSearch();
  bindShellControls();
}

function bindGlobalSearch() {
  const search = document.getElementById('global-search');
  if (!search) return;

  search.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const query = search.value.trim().toLowerCase();
    if (!query) return;

    const match = pages.find((item) =>
      item.label.toLowerCase().includes(query) || item.hint.toLowerCase().includes(query)
    );

    if (match) {
      window.location.href = match.href;
      return;
    }

    toast('No matching module found.');
  });
}

async function getShellState() {
  const session = getCurrentSession();
  const [notices, faculty, students] = await Promise.all([
    api.notices().catch(() => []),
    api.faculty().catch(() => []),
    api.students().catch(() => [])
  ]);

  if (session) {
    return {
      name: session.name,
      role: humanizeRole(session.role),
      notificationCount: notices.length
    };
  }

  const facultyUser = Array.isArray(faculty) && faculty.length
    ? {
        name: faculty[0].name,
        role: faculty[0].department || 'Faculty Workspace'
      }
    : null;
  const studentUser = Array.isArray(students) && students.length
    ? {
        name: students[0].name,
        role: students[0].department || 'Student Workspace'
      }
    : null;

  return {
    name: (facultyUser || studentUser || { name: 'Guest User' }).name,
    role: (facultyUser || studentUser || { role: 'Sign in first' }).role,
    notificationCount: notices.length
  };
}

function bindShellControls() {
  const notifications = document.getElementById('shell-notifications');
  const userButton = document.getElementById('shell-user-button');
  const sidebarButton = document.getElementById('shell-sidebar-profile');

  if (notifications) {
    notifications.addEventListener('click', () => {
      window.location.href = '/notices.html';
    });
  }

  const handleUserClick = () => {
    const session = getCurrentSession();
    if (session) {
      window.location.href = resolveHomeForRole(session.role);
      return;
    }
    toast('No active session. Sign in to unlock role access.');
    window.location.href = '/faculty.html';
  };

  if (userButton) {
    userButton.addEventListener('click', handleUserClick);
  }

  if (sidebarButton) {
    sidebarButton.addEventListener('click', handleUserClick);
  }
}

async function initializePage() {
  switch (page) {
    case 'dashboard':
      return initDashboardPage();
    case 'students':
      return initStudentsPage();
    case 'faculty':
      return initFacultyPage();
    case 'schedule':
      return initSchedulePage();
    case 'exams':
      return initExamsPage();
    case 'fees':
      return initFeesPage();
    case 'notices':
      return initNoticesPage();
    case 'library':
      return initLibraryPage();
    case 'admin':
      return initAdminPage();
    case 'assistant':
      return initAssistantPage();
    default:
      return initDashboardPage();
  }
}

async function initDashboardPage() {
  const [overview, analytics, communications, students, faculty, library] = await safeLoad([
    api.overview(),
    api.analytics(),
    api.communications(),
    api.students(),
    api.faculty(),
    api.library()
  ]);

  if (!overview || !analytics || !communications || !students || !faculty || !library) return;

  const notices = communications.notices || [];
  const events = communications.events || [];

  renderDashboardStats(document.getElementById('overview-metrics'), analytics);
  renderAttendanceChart(document.getElementById('attendance-chart'), students);
  renderCampusPulse(document.getElementById('campus-pulse'), analytics, notices, students);
  renderModuleHighlights({
    students,
    faculty,
    notices,
    library
  });
  renderAnalyticsBreakdown(analytics);
  renderNoticeFeed(document.getElementById('notice-feed'), notices.slice(0, 4));
  renderRecentActivity(document.getElementById('recent-activity'), students, notices, events, library);
  renderEventStrip(document.getElementById('event-strip'), events);
  updateNotificationBadge(notices.length);
  animateCountUps();
}

async function initStudentsPage() {
  bindRefresh('students-refresh', loadStudentsPage);
  bindForm('student-form', async (payload, form) => {
    await api.registerStudent(payload);
    form.reset();
    toast('Student registered successfully.');
    await loadStudentsPage();
  });
  bindForm('attendance-form', async (payload, form) => {
    await api.attendance(payload);
    form.reset();
    toast('Attendance updated.');
    await loadStudentsPage();
  });
  bindForm('marks-form', async (payload, form) => {
    await api.marks(payload);
    form.reset();
    toast('Marks and result profile updated.');
    await loadStudentsPage();
  });
  await loadStudentsPage();
}

async function loadStudentsPage() {
  const students = await safeLoadSingle(api.students());
  if (!students) return;

  const paid = students.filter((item) => item.feeStatus === 'Paid').length;
  const averageAttendance = students.length
    ? round(students.reduce((sum, item) => sum + Number(item.attendance || 0), 0) / students.length)
    : 0;
  const averageCgpa = students.length
    ? round(students.reduce((sum, item) => sum + Number(item.cgpa || 0), 0) / students.length)
    : 0;

  renderMetricCards('student-metrics', [
    metricCard('Active Students', students.length, 'primary', 'Live registered learners'),
    metricCard('Fees Cleared', paid, 'mint', 'Students currently marked paid'),
    metricCard('Avg Attendance', `${averageAttendance}%`, 'warning', 'Attendance health across the roster'),
    metricCard('Avg CGPA', averageCgpa, 'primary', 'Academic performance signal')
  ]);

  renderTable(
    'students-table',
    ['ID', 'Name', 'Department', 'Semester', 'Attendance', 'CGPA', 'Fee Status', 'Actions'],
    students.map((student) => ([
      `<span class="mono">${escapeHtml(student.studentId)}</span>`,
      escapeHtml(student.name),
      escapeHtml(student.department),
      escapeHtml(student.semester),
      `${escapeHtml(String(student.attendance))}%`,
      escapeHtml(String(student.cgpa)),
      renderBadge(student.feeStatus),
      isAllowed('admin')
        ? `<button class="btn btn-secondary btn-inline" type="button" data-delete-student="${escapeHtml(student.studentId)}">Remove</button>`
        : '<span class="muted-copy">Role restricted</span>'
    ]))
  );
  bindInlineActions('students-table', '[data-delete-student]', async (button) => {
    await api.removeStudent(button.dataset.deleteStudent);
    toast('Student removed.');
    await loadStudentsPage();
  });

  document.getElementById('student-insights').innerHTML = [
    insightRow('Highest Attendance', pickStudentBy(students, 'attendance', 'max')),
    insightRow('Needs Fee Attention', students.find((student) => student.feeStatus !== 'Paid')),
    insightRow('Top CGPA', pickStudentBy(students, 'cgpa', 'max')),
    insightRow('Most Recent Student', students[students.length - 1] || null)
  ].join('');
}

async function initFacultyPage() {
  bindRefresh('faculty-refresh', loadFacultyPage);
  bindForm('faculty-form', async (payload, form) => {
    await api.registerFaculty(payload);
    form.reset();
    toast('Faculty profile created.');
    await loadFacultyPage();
  });
  bindForm('signup-form', async (payload, form) => {
    const session = await signUpAccount(payload);
    form.reset();
    renderAuthStatus(`Account created for ${session.email}.`, 'success');
    toast(`${humanizeRole(session.role)} account created.`);
  });
  bindForm('login-form', async (payload, form) => {
    const session = await signInAccount({
      email: payload.email,
      password: payload.password
    });
    const expectedRole = normalizeRoleUi(payload.role);
    if (expectedRole && session.role !== expectedRole) {
      await logoutAccount();
      form.reset();
      renderAuthStatus(`This account is ${humanizeRole(session.role)}, not ${humanizeRole(expectedRole)}.`, 'warning');
      toast('Selected role does not match the account.');
      return;
    }
    form.reset();
    renderAuthStatus(`Signed in as ${humanizeRole(session.role)}.`, 'success');
    await injectShell();
    applyRoleAccess();
    updateAuthExperience();
    toast('Firebase sign-in successful.');
  });
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      runAction(async () => {
        await logoutAccount();
        renderAuthStatus('Logged out successfully.', 'info');
        updateAuthExperience();
        toast('Signed out.');
      });
    });
  }
  await loadFacultyPage();
  updateAuthExperience();
}

async function loadFacultyPage() {
  const faculty = await safeLoadSingle(api.faculty());
  if (!faculty) return;

  renderMetricCards('faculty-metrics', [
    metricCard('Faculty Members', faculty.length, 'primary', 'Current teaching directory'),
    metricCard('Departments', new Set(faculty.map((item) => item.department)).size, 'mint', 'Distinct faculty verticals'),
    metricCard('Allocated Courses', faculty.filter((item) => item.allocatedCourse && item.allocatedCourse !== 'Unassigned').length, 'warning', 'Mapped instructional ownership'),
    metricCard('Office Hours', faculty.filter((item) => item.officeHours && item.officeHours !== 'To be announced').length, 'primary', 'Faculty availability published')
  ]);

  renderTable(
    'faculty-table',
    ['Faculty ID', 'Name', 'Department', 'Specialization', 'Allocated Course', 'Office Hours', 'Actions'],
    faculty.map((member) => ([
      `<span class="mono">${escapeHtml(member.facultyId)}</span>`,
      escapeHtml(member.name),
      escapeHtml(member.department),
      escapeHtml(member.specialization),
      escapeHtml(member.allocatedCourse),
      escapeHtml(member.officeHours),
      isAllowed('admin')
        ? `<button class="btn btn-secondary btn-inline" type="button" data-delete-faculty="${escapeHtml(member.facultyId)}">Remove</button>`
        : '<span class="muted-copy">Role restricted</span>'
    ]))
  );
  bindInlineActions('faculty-table', '[data-delete-faculty]', async (button) => {
    await api.removeFaculty(button.dataset.deleteFaculty);
    toast('Faculty profile removed.');
    await loadFacultyPage();
  });

  const insights = faculty.length
    ? faculty.slice(0, 4).map((member) => ({
        label: member.department,
        title: member.name,
        description: `${member.specialization} | ${member.allocatedCourse}`
      }))
    : [];

  renderFeedCards('faculty-insights', insights);
}

async function initSchedulePage() {
  bindRefresh('schedule-refresh', loadSchedulePage);
  bindForm('class-form', async (payload, form) => {
    await api.addClass(payload);
    form.reset();
    toast('Class schedule created.');
    await loadSchedulePage();
  });
  bindForm('lab-form', async (payload, form) => {
    await api.addLab(payload);
    form.reset();
    toast('Lab schedule created.');
    await loadSchedulePage();
  });
  await loadSchedulePage();
}

async function loadSchedulePage() {
  const timetable = await safeLoadSingle(api.timetable());
  if (!timetable) return;

  renderMetricCards('schedule-metrics', [
    metricCard('Class Blocks', (timetable.classSchedule || []).length, 'primary', 'Visible classroom sessions'),
    metricCard('Exam Slots', (timetable.examSchedule || []).length, 'warning', 'Scheduled assessments'),
    metricCard('Lab Sessions', (timetable.labSchedule || []).length, 'mint', 'Hands-on practical windows'),
    metricCard('Coordination', 'Live', 'primary', 'Shared academic rhythm')
  ]);

  renderFeedCards('class-schedule', (timetable.classSchedule || []).map((item) => ({
    label: item.day,
    title: `${item.course} | ${item.time}`,
    description: `${item.room} | ${item.faculty || 'Academic desk'}`
  })));

  renderFeedCards('exam-schedule', (timetable.examSchedule || []).map((item) => ({
    label: item.date,
    title: `${item.course} | ${item.slot}`,
    description: `${item.hall} | ${item.type || 'Scheduled exam'}`
  })));

  renderFeedCards('lab-schedule', (timetable.labSchedule || []).map((item) => ({
    label: item.day,
    title: `${item.lab} | ${item.time}`,
    description: `${item.faculty} | ${item.room}`
  })));
}

async function initExamsPage() {
  bindRefresh('exams-refresh', loadExamsPage);
  bindForm('exam-form', async (payload, form) => {
    await api.createExam(payload);
    form.reset();
    toast('Exam created successfully.');
    await loadExamsPage();
  });
  bindForm('report-card-form', async (payload) => {
    const report = await api.reportCard(payload.studentId);
    renderReportCard(report);
  });
  await loadExamsPage();
}

async function loadExamsPage() {
  const exams = await safeLoadSingle(api.exams());
  if (!exams) return;

  renderTable(
    'exams-table',
    ['Exam ID', 'Course', 'Date', 'Slot', 'Hall', 'Type'],
    exams.map((exam) => ([
      `<span class="mono">${escapeHtml(exam.examId)}</span>`,
      escapeHtml(exam.course),
      escapeHtml(exam.date),
      escapeHtml(exam.slot),
      escapeHtml(exam.hall),
      renderBadge(exam.type || 'Scheduled')
    ]))
  );
}

function renderReportCard(report) {
  document.getElementById('report-card').innerHTML = `
    <p class="caps-label">Generated Report Card</p>
    <h3>${escapeHtml(report.studentName)} <span class="mono">(${escapeHtml(report.studentId)})</span></h3>
    <p>${escapeHtml(report.department)} | ${escapeHtml(report.semester)} | Attendance ${escapeHtml(String(report.attendance))}% | CGPA ${escapeHtml(String(report.cgpa))}</p>
    ${buildTable(
      ['Subject', 'Marks', 'Grade'],
      (report.reportCard || []).map((subject) => ([
        escapeHtml(subject.subject),
        escapeHtml(String(subject.marks)),
        renderBadge(subject.grade)
      ]))
    )}
  `;
}

async function initFeesPage() {
  bindRefresh('fees-refresh', loadFeesPage);
  bindForm('fee-form', async (payload, form) => {
    await api.payFee(payload);
    form.reset();
    toast('Fee payment recorded.');
    await loadFeesPage();
  });
  await loadFeesPage();
}

async function loadFeesPage() {
  const fees = await safeLoadSingle(api.fees());
  if (!fees) return;

  const statuses = fees.statuses || [];
  const receipts = fees.receipts || [];
  const totalDue = statuses.reduce((sum, item) => sum + Number(item.feeDue || 0), 0);
  const paid = statuses.filter((item) => item.feeStatus === 'Paid').length;
  const pending = statuses.length - paid;

  document.getElementById('fee-summary-cards').innerHTML = [
    insightMetric('Total Due', formatCurrency(totalDue), 'warning'),
    insightMetric('Students Paid', paid, 'mint'),
    insightMetric('Pending Accounts', pending, 'danger'),
    insightMetric('Receipts Logged', receipts.length, 'primary')
  ].join('');

  renderTable(
    'fees-table',
    ['Student ID', 'Student Name', 'Fee Status', 'Amount Due'],
    statuses.map((item) => ([
      `<span class="mono">${escapeHtml(item.studentId)}</span>`,
      escapeHtml(item.studentName),
      renderBadge(item.feeStatus),
      formatCurrency(item.feeDue)
    ]))
  );

  renderTable(
    'receipts-table',
    ['Receipt ID', 'Student', 'Amount', 'Mode', 'Date'],
    receipts.map((receipt) => ([
      `<span class="mono">${escapeHtml(receipt.receiptId)}</span>`,
      escapeHtml(receipt.studentName),
      formatCurrency(receipt.amount),
      renderBadge(receipt.mode),
      escapeHtml(receipt.date)
    ]))
  );
}

async function initNoticesPage() {
  bindRefresh('notices-refresh', loadNoticesPage);
  bindForm('notice-form', async (payload, form) => {
    await api.addNotice(payload);
    form.reset();
    toast('Notice published.');
    await loadNoticesPage();
  });
  bindForm('event-form', async (payload, form) => {
    await api.addEvent(payload);
    form.reset();
    toast('Event created.');
    await loadNoticesPage();
  });
  await loadNoticesPage();
}

async function loadNoticesPage() {
  const [notices, communications] = await safeLoad([api.notices(), api.communications()]);
  if (!notices || !communications) return;

  document.getElementById('communication-metrics').innerHTML = [
    insightMetric('Live Notices', notices.length, 'primary'),
    insightMetric('Event Announcements', (communications.events || []).length, 'mint'),
    insightMetric('High Priority Items', notices.filter((item) => String(item.priority).toLowerCase().includes('high')).length, 'warning')
  ].join('');

  renderFeedCards('notice-list', notices.map((notice) => ({
    label: `${notice.category} | ${notice.priority}`,
    title: notice.title,
    description: `${notice.message} | ${notice.date}`
  })));

  renderFeedCards('event-list', (communications.events || []).map((event) => ({
    label: event.category || 'Event',
    title: event.title,
    description: `${event.date || 'Upcoming'} | ${event.message || ''}`
  })));
}

async function initLibraryPage() {
  bindRefresh('library-refresh', loadLibraryPage);
  bindForm('book-form', async (payload, form) => {
    await api.addBook(payload);
    form.reset();
    toast('Book added to library.');
    await loadLibraryPage();
  });
  bindForm('issue-form', async (payload, form) => {
    await api.issueBook(payload);
    form.reset();
    toast('Book issued.');
    await loadLibraryPage();
  });
  bindForm('return-form', async (payload, form) => {
    await api.returnBook(payload);
    form.reset();
    toast('Book returned.');
    await loadLibraryPage();
  });
  await loadLibraryPage();
}

async function loadLibraryPage() {
  const library = await safeLoadSingle(api.library());
  if (!library) return;

  const issued = library.filter((book) => book.status === 'Issued').length;
  const available = library.length - issued;
  const totalFine = library.reduce((sum, book) => sum + Number(book.fine || 0), 0);

  renderMetricCards('library-metrics', [
    metricCard('Catalog Size', library.length, 'primary', 'Tracked titles'),
    metricCard('Issued Books', issued, 'warning', 'Active borrowers'),
    metricCard('Available Books', available, 'mint', 'Ready for circulation'),
    metricCard('Outstanding Fines', formatCurrency(totalFine), 'danger', 'Fine visibility')
  ]);

  renderTable(
    'library-table',
    ['Book ID', 'Title', 'Author', 'Status', 'Borrower', 'Due Date', 'Fine'],
    library.map((book) => ([
      `<span class="mono">${escapeHtml(book.bookId)}</span>`,
      escapeHtml(book.title),
      escapeHtml(book.author),
      renderBadge(book.status),
      escapeHtml(book.borrower),
      escapeHtml(book.dueDate),
      formatCurrency(book.fine)
    ]))
  );
}

async function initAdminPage() {
  bindRefresh('admin-refresh', loadAdminPage);
  await loadAdminPage();
}

async function loadAdminPage() {
  const analytics = await safeLoadSingle(api.analytics());
  if (!analytics) return;

  renderMetricCards('analytics-grid', [
    metricCard('Total Students', analytics.totalStudents, 'primary', 'Campus learners'),
    metricCard('Total Faculty', analytics.totalFaculty, 'mint', 'Teaching staff'),
    metricCard('Pending Fees', analytics.pendingFees, 'warning', 'Accounts needing action'),
    metricCard('Books Issued', analytics.booksIssued, 'primary', 'Library circulation'),
    metricCard('Average Attendance', `${analytics.averageAttendance}%`, 'mint', 'Campus attendance quality'),
    metricCard('Average CGPA', analytics.averageCgpa, 'primary', 'Academic average'),
    metricCard('Active Notices', analytics.activeNotices, 'warning', 'Live communication load'),
    metricCard('Paid Fees', analytics.paidFees, 'mint', 'Settled finance records')
  ]);

  document.getElementById('admin-story').innerHTML = [
    narrativeBlock('Academic Stability', `Average attendance is ${analytics.averageAttendance}% and average CGPA is ${analytics.averageCgpa}, giving a quick academic health reading.`),
    narrativeBlock('Financial Pressure', `${analytics.pendingFees} student accounts still show pending fees while ${analytics.paidFees} are fully settled.`),
    narrativeBlock('Operational Load', `${analytics.activeNotices} active notices and ${analytics.booksIssued} issued books indicate current communication and library activity.`)
  ].join('');

  document.getElementById('admin-status-grid').innerHTML = [
    statusCard('Attendance Health', analytics.averageAttendance >= 90 ? 'Strong' : 'Watch', analytics.averageAttendance >= 90 ? 'success' : 'warning'),
    statusCard('Fee Recovery', analytics.pendingFees === 0 ? 'Clear' : 'Pending', analytics.pendingFees === 0 ? 'success' : 'warning'),
    statusCard('Communication Load', analytics.activeNotices > 5 ? 'High' : 'Normal', analytics.activeNotices > 5 ? 'primary' : 'success'),
    statusCard('Library Turnover', analytics.booksIssued > 0 ? 'Active' : 'Idle', analytics.booksIssued > 0 ? 'primary' : 'warning')
  ].join('');
}

async function initAssistantPage() {
  bindRefresh('assistant-refresh', resetAssistant);
  bindForm('assistant-config-form', async (payload) => {
    setGptOssBaseUrl(payload.baseUrl);
    renderAssistantConnectionStatus();
    toast('GPTOSS worker URL saved.');
  });
  bindPromptChips();
  bindForm('chat-form', async (payload, form) => {
    const result = await askAssistant(payload.question);
    renderChat(result.question, result.answer, result.reasoning);
    form.reset();
  });
  populateAssistantConfig();
  renderAssistantConnectionStatus();
  resetAssistant();
}

function resetAssistant() {
  const chatOutput = document.getElementById('chat-output');
  if (!chatOutput) return;
  chatOutput.innerHTML = `
    <p class="caps-label">Conversation Ready</p>
    <h3>Ask Aurora AI anything about campus operations.</h3>
    <p>Try prompts around exams, attendance, fee status, notices, or library circulation. The assistant uses <strong>${GPTOSS_MODEL}</strong>.</p>
  `;
}

function bindPromptChips() {
  document.querySelectorAll('.prompt-chip').forEach((button) => {
    button.addEventListener('click', async () => {
      await runAction(async () => {
        const result = await askAssistant(button.dataset.prompt);
        renderChat(result.question, result.answer, result.reasoning);
      });
    });
  });
}

function renderChat(question, answer, reasoning = '') {
  document.getElementById('chat-output').innerHTML = `
    <p class="caps-label">Latest Response</p>
    <div class="feed-card">
      <h3>${escapeHtml(question)}</h3>
      ${reasoning ? `<p><strong>Reasoning:</strong> ${escapeHtml(reasoning)}</p>` : ''}
      <p>${escapeHtml(answer)}</p>
    </div>
  `;
}

function renderDashboardStats(target, analytics) {
  if (!target) return;
  target.innerHTML = [
    dashboardStatCard('students', 'Total Students', analytics.totalStudents, '+12%', 'positive', 'from last month'),
    dashboardStatCard('faculty', 'Faculty Count', analytics.totalFaculty, '+4%', 'positive', 'from last term'),
    dashboardStatCard('attendance', 'Attendance Rate', `${analytics.averageAttendance}%`, '+2%', 'positive', 'from last week'),
    dashboardStatCard('fees', 'Fees Pending', analytics.pendingFees, '-5%', 'negative', 'from last month')
  ].join('');
}

function renderAttendanceChart(target, students) {
  if (!target) return;
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const average = Number(round(students.length
    ? students.reduce((sum, student) => sum + Number(student.attendance || 0), 0) / students.length
    : 0));
  const values = labels.map((_, index) => {
    if (!students.length) return 0;
    const dayBias = [4, 2, 0, 3, 1, -2, -4][index] || 0;
    const source = Number(students[index % students.length]?.attendance || average);
    return clamp(Math.round((source + average) / 2 + dayBias), 0, 100);
  });
  if (attendanceChart) {
    attendanceChart.destroy();
  }
  if (!window.Chart) return;

  attendanceChart = new window.Chart(target, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Attendance',
          data: values,
          backgroundColor: '#3B5BDB',
          hoverBackgroundColor: '#2F50D2',
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false,
          maxBarThickness: 34
        },
        {
          type: 'line',
          label: 'Average',
          data: labels.map(() => average),
          borderColor: '#F59F00',
          borderWidth: 2,
          borderDash: [6, 6],
          pointRadius: 0,
          tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A1F36',
          titleFont: { family: 'Plus Jakarta Sans', weight: '700' },
          bodyFont: { family: 'Plus Jakarta Sans' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: '#6B7280',
            font: { family: 'Plus Jakarta Sans', weight: '600' }
          }
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            callback: (value) => `${value}%`,
            color: '#9CA3AF',
            font: { family: 'Plus Jakarta Sans' }
          },
          grid: {
            color: '#F0F0F0'
          },
          border: { display: false }
        }
      }
    }
  });
}

function renderCampusPulse(target, analytics, notices, students) {
  if (!target) return;
  target.classList.remove('skeleton-block');
  const liveStudents = students.filter((student) => {
    const status = String(student.loginStatus || '').toLowerCase();
    return status.includes('active') || status.includes('registered');
  }).length;
  target.innerHTML = [
    pulseRow('Students Online', liveStudents, '#0CA678'),
    pulseRow('Attendance Rate', `${analytics.averageAttendance}%`, '#F59F00'),
    pulseRow('Pending Fees', analytics.pendingFees, '#F03E3E'),
    pulseRow('New Notices', notices.length, '#3B5BDB')
  ].join('');
}

function renderModuleHighlights(data) {
  const container = document.getElementById('overview-highlights');
  if (!container) return;
  container.innerHTML = [
    quickModuleCard('students', 'Students', data.students.length, 'Registered student profiles', '/students.html'),
    quickModuleCard('faculty', 'Faculty', data.faculty.length, 'Academic staff directory', '/faculty.html'),
    quickModuleCard('notices', 'Notices', data.notices.length, 'Published alerts and circulars', '/notices.html'),
    quickModuleCard('library', 'Library Books', data.library.length, 'Tracked catalog entries', '/library.html')
  ].join('');
}

function renderAnalyticsBreakdown(analytics) {
  const node = document.getElementById('analytics-breakdown');
  if (!node) return;
  node.innerHTML = [
    insightMetric('Average Attendance', `${analytics.averageAttendance}%`, 'warning'),
    insightMetric('Average CGPA', analytics.averageCgpa, 'primary'),
    insightMetric('Paid Fees', analytics.paidFees, 'mint'),
    insightMetric('Books Issued', analytics.booksIssued, 'primary')
  ].join('');
}

function renderNoticeFeed(target, notices) {
  renderFeedCards(target.id, notices.map((item) => ({
    label: `${item.category} | ${item.priority}`,
    title: item.title,
    description: `${item.message} | ${item.date}`
  })));
}

function renderEventFeed(target, events) {
  renderFeedCards(target.id, events.map((item) => ({
    label: item.category || 'Event',
    title: item.title,
    description: `${item.date || 'Upcoming'} | ${item.message || ''}`
  })));
}

function renderRecentActivity(target, students, notices, events, library) {
  if (!target) return;
  target.classList.remove('skeleton-block');
  const activity = [
    ...students.slice(-2).reverse().map((student, index) => ({
      badge: initials(student.name),
      text: `${student.name} enrolled in ${student.department}`,
      time: `${index + 1}h ago`,
      color: '#0CA678'
    })),
    ...notices.slice(0, 2).map((notice, index) => ({
      badge: 'NT',
      text: `${notice.title} was published for ${notice.category}`,
      time: `${index + 2}h ago`,
      color: '#3B5BDB'
    })),
    ...events.slice(0, 1).map((event) => ({
      badge: 'EV',
      text: `${event.title} scheduled at ${event.venue}`,
      time: 'Today',
      color: '#7048E8'
    })),
    ...library.slice(0, 1).map((book) => ({
      badge: 'LB',
      text: `${book.title} is ${book.status.toLowerCase()} in library`,
      time: '1d ago',
      color: '#F59F00'
    }))
  ].slice(0, 6);

  if (!activity.length) {
    target.innerHTML = '<div class="empty-state">No campus activity has been recorded yet.</div>';
    return;
  }

  target.innerHTML = activity.map((item) => `
    <div class="activity-item">
      <div class="activity-avatar" style="background:${item.color}">${escapeHtml(item.badge)}</div>
      <div>${escapeHtml(item.text)}</div>
      <div class="activity-time">${escapeHtml(item.time)}</div>
    </div>
  `).join('');
}

function renderEventStrip(target, events) {
  if (!target) return;
  if (!events.length) {
    target.innerHTML = '<div class="empty-state">No upcoming events scheduled yet.</div>';
    return;
  }
  target.innerHTML = events.slice(0, 8).map((event) => `
    <article class="event-pill">
      <span class="event-pill-date">${escapeHtml(event.date || 'Upcoming')}</span>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.venue || event.category || 'Campus')}</p>
    </article>
  `).join('');
}

function renderFeedCards(containerId, items) {
  const node = document.getElementById(containerId);
  if (!node) return;
  node.classList.remove('skeleton-block');
  if (!items.length) {
    node.innerHTML = '<div class="empty-state">No records available yet. Use the forms on this module to create the first item.</div>';
    return;
  }
  node.innerHTML = items.map((item) => `
    <div class="feed-card">
      <p class="caps-label">${escapeHtml(item.label || 'Update')}</p>
      <h3>${escapeHtml(item.title || 'Untitled')}</h3>
      <p>${escapeHtml(item.description || '')}</p>
    </div>
  `).join('');
}

function renderMetricCards(containerId, items) {
  const node = document.getElementById(containerId);
  if (!node) return;
  node.innerHTML = items.map((item) => metricCardMarkup(item.label, item.value, item.tone, item.description)).join('');
}

function metricCard(label, value, tone, description) {
  return { label, value, tone, description };
}

function metricCardMarkup(label, value, tone, description) {
  return `
    <article class="stat-card">
      <p class="caps-label">${escapeHtml(label)}</p>
      <strong class="stat-number ${tone || 'primary'}"><span class="stat-num">${escapeHtml(String(value))}</span></strong>
      <div class="stat-trend">
        <span class="trend-icon">+</span>
        <span>${escapeHtml(description || 'Live metric')}</span>
      </div>
    </article>
  `;
}

function dashboardStatCard(key, label, value, trend, trendTone, description) {
  const statIcons = {
    students: icons.students,
    faculty: icons.faculty,
    attendance: icons.schedule,
    fees: icons.fees
  };
  return `
    <article class="stat-card ${key}-card">
      <div class="dashboard-stat-head">
        <span class="dashboard-stat-icon">${statIcons[key] || icons.dashboard}</span>
        <span class="stat-trend-pill ${trendTone === 'negative' ? 'trend-negative' : 'trend-positive'}">${trendTone === 'negative' ? '↓' : '↑'} ${escapeHtml(trend)}</span>
      </div>
      <strong class="stat-number"><span class="stat-num" data-target="${escapeHtml(String(value))}">0</span></strong>
      <p class="dashboard-stat-topline">${escapeHtml(label)}</p>
      <span class="stat-trend-copy">${trendTone === 'negative' ? '↓' : '↑'} ${escapeHtml(trend)} ${escapeHtml(description)}</span>
    </article>
  `;
}

function pulseRow(label, value, color) {
  return `
    <div class="snapshot-row">
      <span class="snapshot-dot" style="background:${color}"></span>
      <span>${escapeHtml(label)}</span>
      <strong class="snapshot-value"><span class="stat-num" data-target="${escapeHtml(String(value))}">0</span></strong>
    </div>
  `;
}

function quickModuleCard(key, label, value, description, href) {
  const colors = {
    students: '#00ffb2',
    faculty: '#6c63ff',
    notices: '#38bdf8',
    library: '#a78bfa'
  };
  return `
    <a class="glass-card module-card" href="${href}" style="--card-accent:${colors[key] || '#6c63ff'}">
      <span class="module-card-icon" style="color:${colors[key] || '#6c63ff'}; background:${hexToRgba(colors[key] || '#6c63ff', 0.12)}">${icons[key] || icons.dashboard}</span>
      <p class="caps-label">${escapeHtml(label)}</p>
      <strong class="module-card-number"><span class="stat-num" data-target="${escapeHtml(String(value))}">0</span></strong>
      <p class="module-card-copy">${escapeHtml(description)}</p>
      <span class="module-card-link">View All -&gt;</span>
    </a>
  `;
}

function renderTable(containerId, headers, rows) {
  const node = document.getElementById(containerId);
  if (!node) return;
  node.innerHTML = buildTable(headers, rows);
}

function buildTable(headers, rows) {
  if (!rows.length) {
    return '<div class="empty-state">No records found yet. Use the creation forms on this page to populate the module.</div>';
  }
  return `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderBadge(label) {
  const normalized = String(label || '').toLowerCase();
  let tone = 'primary';
  if (normalized.includes('paid') || normalized.includes('available') || normalized.includes('active') || normalized === 'a') {
    tone = 'success';
  } else if (normalized.includes('pending') || normalized.includes('mid') || normalized.includes('offline') || normalized.includes('a-')) {
    tone = 'warning';
  } else if (normalized.includes('issued') || normalized.includes('high') || normalized.includes('absent') || normalized.includes('overdue') || normalized.includes('b+')) {
    tone = 'danger';
  }
  return `<span class="badge ${tone}">${escapeHtml(label)}</span>`;
}

function insightMetric(label, value, tone) {
  return `
    <div class="mini-stat-row">
      <div>
        <p class="caps-label">${escapeHtml(label)}</p>
        <strong class="stat-number ${tone || 'primary'}" style="font-size:1.5rem">${escapeHtml(String(value))}</strong>
      </div>
      <span class="badge ${toneToBadge(tone)}">${escapeHtml(toneLabel(tone))}</span>
    </div>
  `;
}

function insightRow(title, student) {
  if (!student) {
    return '<div class="empty-state">Not enough live data yet for this insight.</div>';
  }
  const name = student.name || 'Student';
  const id = student.studentId || 'N/A';
  return `
    <div class="insight-row">
      <div>
        <p class="caps-label">${escapeHtml(title)}</p>
        <strong>${escapeHtml(name)}</strong>
      </div>
      <span class="mono">${escapeHtml(id)}</span>
    </div>
  `;
}

function narrativeBlock(title, body) {
  return `
    <div class="feed-card">
      <p class="caps-label">Insight</p>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </div>
  `;
}

function statusCard(label, value, tone) {
  return `
    <div class="analytics-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <div class="stat-trend">
        ${renderBadge(toneLabel(tone))}
      </div>
    </div>
  `;
}

function pickStudentBy(students, field, mode) {
  if (!students.length) return null;
  const copy = [...students];
  copy.sort((a, b) => Number(a[field] || 0) - Number(b[field] || 0));
  return mode === 'max' ? copy[copy.length - 1] : copy[0];
}

function toneLabel(tone) {
  if (tone === 'mint' || tone === 'success') return 'Strong';
  if (tone === 'warning') return 'Watch';
  if (tone === 'danger') return 'Critical';
  return 'Live';
}

function toneToBadge(tone) {
  if (tone === 'mint') return 'success';
  if (tone === 'warning') return 'warning';
  if (tone === 'danger') return 'danger';
  return 'primary';
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatCompactCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const value = Number.parseInt(full, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function initials(name) {
  return String(name || 'AU')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function updateNotificationBadge(count) {
  const badge = document.getElementById('notification-count');
  if (!badge) return;
  badge.textContent = String(count);
}

function animateCountUps() {
  document.querySelectorAll('.stat-num[data-target]').forEach((node) => {
    const targetText = node.dataset.target || '0';
    const isPercent = targetText.trim().endsWith('%');
    const numericTarget = Number.parseFloat(targetText.replace(/[^0-9.]/g, '')) || 0;
    const suffix = isPercent ? '%' : '';
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = numericTarget * eased;
      const formatted = isPercent
        ? `${Math.round(value)}${suffix}`
        : Math.round(value).toLocaleString('en-IN');
      node.textContent = formatted;
      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        node.textContent = isPercent
          ? `${Math.round(numericTarget)}${suffix}`
          : Math.round(numericTarget).toLocaleString('en-IN');
      }
    };

    window.requestAnimationFrame(tick);
  });
}

function bindRefresh(id, loader) {
  const node = document.getElementById(id);
  if (!node) return;
  node.addEventListener('click', () => runAction(loader));
}

function bindForm(id, handler) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runAction(() => handler(formToObject(form), form));
  });
}

function bindInlineActions(containerId, selector, handler) {
  const root = document.getElementById(containerId);
  if (!root) return;
  root.querySelectorAll(selector).forEach((button) => {
    button.addEventListener('click', () => {
      runAction(() => handler(button));
    });
  });
}

async function askAssistant(question) {
  const baseUrl = getGptOssBaseUrl();
  if (!baseUrl) {
    throw new Error('Save your GPTOSS Worker URL first on the assistant page.');
  }

  const session = getCurrentSession();
  const payload = {
    model: GPTOSS_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are Aurora Campus ERP assistant. Answer clearly and briefly for college operations like attendance, exams, fees, timetable, notices, and library.'
      },
      {
        role: 'user',
        content: question
      }
    ],
    stream: true,
    metadata: {
      reasoning_effort: 'medium',
      gptoss_user_id: session?.uid || session?.email || 'guest-user',
      gptoss_thread_id: getOrCreateGptOssThreadId()
    }
  };

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Reasoning-Effort': 'medium'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`GPTOSS request failed: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    const data = await response.json();
    return {
      question,
      answer: data?.choices?.[0]?.message?.content || 'No response returned by GPTOSS.',
      reasoning: data?.choices?.[0]?.message?.reasoning_content || ''
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer = '';
  let reasoning = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';

    for (const part of parts) {
      const line = part
        .split('\n')
        .find((entry) => entry.startsWith('data: '));
      if (!line) continue;
      const data = line.slice(6).trim();
      if (!data || data === '[DONE]') continue;

      let json;
      try {
        json = JSON.parse(data);
      } catch (error) {
        continue;
      }

      const delta = json?.choices?.[0]?.delta || {};
      if (delta.reasoning_content) {
        reasoning += delta.reasoning_content;
      }
      if (delta.content) {
        answer += delta.content;
      }
    }
  }

  return {
    question,
    answer: answer || 'No assistant response was returned.',
    reasoning
  };
}

function getGptOssBaseUrl() {
  const raw = window.localStorage.getItem(GPTOSS_BASE_URL_KEY) || '';
  return raw.trim().replace(/\/+$/, '');
}

function setGptOssBaseUrl(value) {
  const normalized = String(value || '').trim().replace(/\/+$/, '');
  window.localStorage.setItem(GPTOSS_BASE_URL_KEY, normalized);
}

function getOrCreateGptOssThreadId() {
  const existing = window.localStorage.getItem(GPTOSS_THREAD_KEY);
  if (existing) return existing;
  const generated = `thr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(GPTOSS_THREAD_KEY, generated);
  return generated;
}

function populateAssistantConfig() {
  const input = document.getElementById('assistant-base-url');
  if (!input) return;
  input.value = getGptOssBaseUrl();
}

function renderAssistantConnectionStatus() {
  const node = document.getElementById('assistant-connection-status');
  if (!node) return;
  const baseUrl = getGptOssBaseUrl();
  node.innerHTML = baseUrl
    ? `Connected to <strong>${escapeHtml(baseUrl)}</strong><br>Model: <strong>${GPTOSS_MODEL}</strong>`
    : `Model: <strong>${GPTOSS_MODEL}</strong><br>Save your GPTOSS Worker URL to enable live chat.`;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function humanizeRole(role) {
  const normalized = String(role || '').trim().toLowerCase();
  if (!normalized) return 'Workspace User';
  return normalized
    .split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function safeLoad(promises) {
  try {
    return await Promise.all(promises);
  } catch (error) {
    toast(error.message || 'Unable to load page data.');
    return [];
  }
}

async function safeLoadSingle(promise) {
  try {
    return await promise;
  } catch (error) {
    toast(error.message || 'Unable to load page data.');
    return null;
  }
}

async function runAction(action) {
  try {
    await action();
  } catch (error) {
    toast(error.message || 'Something went wrong.');
  }
}

function resolveHomeForRole(role) {
  const normalized = normalizeRoleUi(role);
  if (normalized === 'admin') return '/admin.html';
  if (normalized === 'faculty') return '/faculty.html';
  return '/students.html';
}

function normalizeRoleUi(role) {
  const normalized = String(role || '').trim().toLowerCase();
  return ['student', 'faculty', 'admin'].includes(normalized) ? normalized : '';
}

function currentRole() {
  return normalizeRoleUi(getCurrentSession()?.role);
}

function isAllowed(...roles) {
  const activeRole = currentRole();
  if (!activeRole) return false;
  return roles.includes(activeRole);
}

function applyRoleAccess() {
  const role = currentRole();
  setFormAccess('student-form', role === 'admin', 'Admin access required to create student accounts.');
  setFormAccess('attendance-form', role === 'faculty' || role === 'admin', 'Faculty or admin access required to mark attendance.');
  setFormAccess('marks-form', role === 'faculty' || role === 'admin', 'Faculty or admin access required to upload marks.');
  setFormAccess('faculty-form', role === 'admin', 'Admin access required to manage faculty accounts.');
  setFormAccess('class-form', role === 'faculty' || role === 'admin', 'Faculty or admin access required to manage classes.');
  setFormAccess('lab-form', role === 'faculty' || role === 'admin', 'Faculty or admin access required to manage labs.');
  setFormAccess('exam-form', role === 'faculty' || role === 'admin', 'Faculty or admin access required to create exams.');
  setFormAccess('notice-form', role === 'admin', 'Admin access required to publish notices.');
  setFormAccess('event-form', role === 'admin', 'Admin access required to publish events.');
  setFormAccess('book-form', role === 'admin', 'Admin access required to add library books.');
  setFormAccess('issue-form', role === 'faculty' || role === 'admin', 'Faculty or admin access required to issue books.');
  setFormAccess('return-form', role === 'faculty' || role === 'admin', 'Faculty or admin access required to return books.');
  setFormAccess('fee-form', role === 'student' || role === 'admin', 'Student or admin access required to record fee payments.');

  const adminPageState = document.getElementById('admin-access-state');
  if (adminPageState) {
    adminPageState.innerHTML = role === 'admin'
      ? '<span class="badge success">Admin session active</span>'
      : '<span class="badge warning">Read-only preview. Sign in as admin for full control.</span>';
  }
}

function setFormAccess(id, allowed, message) {
  const form = document.getElementById(id);
  if (!form) return;

  form.classList.toggle('is-locked', !allowed);
  Array.from(form.elements).forEach((element) => {
    if (element.tagName === 'BUTTON' || element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
      if (element.id === 'logout-button') return;
      element.disabled = !allowed;
    }
  });

  let note = form.nextElementSibling;
  if (!note || !note.classList.contains('access-note')) {
    note = document.createElement('p');
    note.className = 'access-note';
    form.insertAdjacentElement('afterend', note);
  }
  note.textContent = allowed ? '' : message;
  note.hidden = allowed;
}

function updateAuthExperience() {
  const session = getCurrentSession();
  const panel = document.getElementById('login-result');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const logoutButton = document.getElementById('logout-button');

  if (panel) {
    panel.innerHTML = session
      ? `
        <p class="caps-label">Active Session</p>
        <strong>${escapeHtml(session.name)}</strong>
        <p>${escapeHtml(session.email)} | ${escapeHtml(humanizeRole(session.role))}</p>
      `
      : `
        <p class="caps-label">No Active Session</p>
        <strong>Sign in required</strong>
        <p>Create an account or sign in with Firebase email and password.</p>
      `;
  }

  if (signupForm) signupForm.classList.toggle('is-locked', Boolean(session));
  if (loginForm) loginForm.classList.toggle('is-locked', Boolean(session));
  [signupForm, loginForm].forEach((form) => {
    if (!form) return;
    Array.from(form.elements).forEach((element) => {
      element.disabled = Boolean(session);
    });
  });
  if (logoutButton) logoutButton.disabled = !session;
}

function renderAuthStatus(message, tone) {
  const panel = document.getElementById('login-result');
  if (!panel) return;
  panel.innerHTML = `
    <p class="caps-label">${escapeHtml(tone || 'info')}</p>
    <strong>${escapeHtml(message)}</strong>
  `;
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function round(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function toast(message) {
  const node = document.getElementById('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  window.clearTimeout(node.timeoutId);
  node.timeoutId = window.setTimeout(() => node.classList.remove('show'), 2400);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
