import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDMV7fQBa5NDeI7hDCq1YIvoLlzImUvI_g',
  authDomain: 'college-management-c4b43.firebaseapp.com',
  databaseURL: 'https://college-management-c4b43-default-rtdb.firebaseio.com',
  projectId: 'college-management-c4b43',
  storageBucket: 'college-management-c4b43.firebasestorage.app',
  messagingSenderId: '621825033167',
  appId: '1:621825033167:web:81a8875e7dfc4055d6c8ba',
  measurementId: 'G-JDCCYRGTEM'
};

const app = initializeApp(firebaseConfig);
try {
  getAnalytics(app);
} catch (error) {
  // Analytics can fail on localhost or unsupported browsers; auth/data should still work.
}

const auth = getAuth(app);
const db = getDatabase(app);
const ROOT = 'erp';

let currentSession = null;
let readyResolver;
const readyPromise = new Promise((resolve) => {
  readyResolver = resolve;
});
let readyResolved = false;

onAuthStateChanged(auth, async (user) => {
  currentSession = user ? await buildSession(user) : null;
  if (!readyResolved) {
    readyResolved = true;
    readyResolver(currentSession);
  }
  window.dispatchEvent(new CustomEvent('aurora:session-change', { detail: currentSession }));
});

export async function initFirebaseSession() {
  await readyPromise;
  return currentSession;
}

export function getCurrentSession() {
  return currentSession;
}

export async function signUpAccount({ name, email, password, role }) {
  const normalizedRole = normalizeRole(role);
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;
  const profile = {
    uid,
    name: firstNonBlank(name, email.split('@')[0]),
    email,
    role: normalizedRole,
    createdAt: new Date().toISOString()
  };

  if (normalizedRole === 'student') {
    const studentId = await nextCode('students', 'STU');
    profile.studentId = studentId;
    await setNode(`students/${studentId}`, {
      studentId,
      name: profile.name,
      email,
      department: 'Undeclared',
      semester: 'Semester 1',
      attendance: 0,
      cgpa: 0,
      feeStatus: 'Pending',
      feeDue: 0,
      mentor: 'Not Assigned',
      phone: '-',
      loginStatus: 'Active',
      uid
    });
  }

  if (normalizedRole === 'faculty') {
    const facultyId = await nextCode('faculty', 'FAC');
    profile.facultyId = facultyId;
    await setNode(`faculty/${facultyId}`, {
      facultyId,
      name: profile.name,
      department: 'General',
      specialization: 'Academic Advisory',
      allocatedCourse: 'Unassigned',
      officeHours: 'To be announced',
      loginStatus: 'Active',
      email,
      uid
    });
  }

  await setNode(`users/${uid}`, profile);
  currentSession = await buildSession(credential.user);
  return currentSession;
}

export async function signInAccount({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  currentSession = await buildSession(credential.user);
  return currentSession;
}

export async function logoutAccount() {
  await signOut(auth);
  currentSession = null;
}

export async function getOverview() {
  const analytics = await getAdminAnalytics();
  return {
    platformName: 'Aurora Campus ERP',
    subtitle: 'Firebase-backed academic operations system',
    heroMetrics: [
      metric('Students', analytics.totalStudents, 'Active campus learners'),
      metric('Faculty', analytics.totalFaculty, 'Teaching and mentors'),
      metric('Notices', analytics.activeNotices, 'Live institutional updates'),
      metric('Library Books', analytics.totalLibraryBooks, 'Trackable resources')
    ],
    moduleHighlights: [
      module('Student Management', 'Registration, attendance, grades, and fee records'),
      module('Faculty Workspace', 'Course allocation, marks entry, and attendance tools'),
      module('Examinations', 'Schedules, marks, results, and report cards'),
      module('Administration', 'Notices, analytics, library, and full control')
    ],
    quickStats: analytics
  };
}

export async function getStudents() {
  return values('students', 'studentId');
}

export async function registerStudent(payload) {
  const studentId = firstNonBlank(payload.studentId, await nextCode('students', 'STU'));
  const existing = await readNode(`students/${studentId}`);
  if (existing) throw new Error(`Student ID already exists: ${studentId}`);

  const record = {
    studentId,
    name: firstNonBlank(payload.name, 'New Student'),
    email: firstNonBlank(payload.email, `${studentId.toLowerCase()}@aurora.edu`),
    department: firstNonBlank(payload.department, 'Undeclared'),
    semester: firstNonBlank(payload.semester, 'Semester 1'),
    attendance: Number(payload.attendance || 0),
    cgpa: Number(payload.cgpa || 0),
    feeStatus: firstNonBlank(payload.feeStatus, 'Pending'),
    feeDue: Number(payload.feeDue || 0),
    mentor: firstNonBlank(payload.mentor, 'Not Assigned'),
    phone: firstNonBlank(payload.phone, '-'),
    loginStatus: 'Active'
  };
  await setNode(`students/${studentId}`, record);
  return record;
}

export async function removeStudent(studentId) {
  await removeNode(`students/${studentId}`);
}

export async function getFaculty() {
  return values('faculty', 'facultyId');
}

export async function registerFaculty(payload) {
  const facultyId = firstNonBlank(payload.facultyId, await nextCode('faculty', 'FAC'));
  const existing = await readNode(`faculty/${facultyId}`);
  if (existing) throw new Error(`Faculty ID already exists: ${facultyId}`);

  const record = {
    facultyId,
    name: firstNonBlank(payload.name, 'New Faculty Member'),
    department: firstNonBlank(payload.department, 'General'),
    specialization: firstNonBlank(payload.specialization, 'Academic Advisory'),
    allocatedCourse: firstNonBlank(payload.allocatedCourse, 'Unassigned'),
    officeHours: firstNonBlank(payload.officeHours, 'To be announced'),
    loginStatus: 'Active',
    email: firstNonBlank(payload.email, `${facultyId.toLowerCase()}@aurora.edu`)
  };
  await setNode(`faculty/${facultyId}`, record);
  return record;
}

export async function removeFaculty(facultyId) {
  await removeNode(`faculty/${facultyId}`);
}

export async function login(payload) {
  const session = await signInAccount({
    email: payload.email,
    password: payload.password
  });
  return {
    status: 'success',
    role: session.role,
    username: session.name,
    message: `Signed in as ${session.role}.`
  };
}

export async function recordAttendance(payload) {
  const student = await requireStudent(payload.studentId);
  const attendance = Number(payload.attendance || student.attendance || 0);
  await updateNode(`students/${student.studentId}`, { attendance });
  return { status: 'updated', studentId: student.studentId, attendance, message: 'Attendance updated successfully.' };
}

export async function uploadMarks(payload) {
  const student = await requireStudent(payload.studentId);
  const updates = {};
  if (payload.cgpa) {
    updates.cgpa = Number(payload.cgpa);
  }
  if (Object.keys(updates).length) {
    await updateNode(`students/${student.studentId}`, updates);
  }
  if (payload.subject) {
    const subjectKey = slug(payload.subject);
    await setNode(`results/${student.studentId}/${subjectKey}`, {
      studentId: student.studentId,
      subject: payload.subject,
      marks: Number(payload.marks || 0),
      grade: firstNonBlank(payload.grade, 'NA')
    });
  }
  return {
    status: 'updated',
    studentId: student.studentId,
    cgpa: Number(payload.cgpa || student.cgpa || 0),
    subject: firstNonBlank(payload.subject, ''),
    message: 'Marks and grade profile updated successfully.'
  };
}

export async function getTimetable() {
  const schedules = await values('schedules', 'scheduleId');
  return {
    classSchedule: schedules.filter((item) => item.type === 'CLASS'),
    examSchedule: await getExams(),
    labSchedule: schedules.filter((item) => item.type === 'LAB')
  };
}

export async function addClassSchedule(payload) {
  const scheduleId = firstNonBlank(payload.scheduleId, await nextCode('schedules', 'CLS'));
  const record = {
    scheduleId,
    type: 'CLASS',
    day: firstNonBlank(payload.day, 'Monday'),
    date: firstNonBlank(payload.date, ''),
    time: firstNonBlank(payload.time, '09:00 AM - 10:00 AM'),
    course: firstNonBlank(payload.course, 'Untitled Class'),
    faculty: firstNonBlank(payload.faculty, 'Not Assigned'),
    room: firstNonBlank(payload.room, 'TBD'),
    venue: firstNonBlank(payload.room, 'TBD'),
    title: firstNonBlank(payload.course, 'Untitled Class')
  };
  await setNode(`schedules/${scheduleId}`, record);
  return record;
}

export async function addLabSchedule(payload) {
  const scheduleId = firstNonBlank(payload.scheduleId, await nextCode('schedules', 'LAB'));
  const record = {
    scheduleId,
    type: 'LAB',
    day: firstNonBlank(payload.day, 'Friday'),
    date: firstNonBlank(payload.date, ''),
    time: firstNonBlank(payload.time, '02:00 PM - 04:00 PM'),
    lab: firstNonBlank(payload.lab, 'Untitled Lab'),
    faculty: firstNonBlank(payload.faculty, 'Not Assigned'),
    room: firstNonBlank(payload.room, 'Lab Wing'),
    venue: firstNonBlank(payload.room, 'Lab Wing'),
    title: firstNonBlank(payload.lab, 'Untitled Lab')
  };
  await setNode(`schedules/${scheduleId}`, record);
  return record;
}

export async function getExams() {
  return values('exams', 'examId');
}

export async function createExam(payload) {
  const examId = firstNonBlank(payload.examId, await nextCode('exams', 'EX'));
  const record = {
    examId,
    course: firstNonBlank(payload.course, 'Untitled Exam'),
    date: firstNonBlank(payload.date, '-'),
    slot: firstNonBlank(payload.slot, '-'),
    hall: firstNonBlank(payload.hall, '-'),
    type: firstNonBlank(payload.type, 'Internal')
  };
  await setNode(`exams/${examId}`, record);
  return record;
}

export async function getResults(studentId) {
  const student = await requireStudent(studentId);
  const resultMap = (await readNode(`results/${student.studentId}`)) || {};
  const reportCard = Object.values(resultMap);
  return {
    studentId: student.studentId,
    studentName: student.name,
    department: student.department,
    semester: student.semester,
    attendance: Number(student.attendance || 0),
    cgpa: Number(student.cgpa || 0),
    reportCard
  };
}

export async function getFeeSummary() {
  const students = await getStudents();
  const receipts = await values('feeReceipts', 'receiptId');
  return {
    statuses: students.map((student) => ({
      studentId: student.studentId,
      studentName: student.name,
      feeStatus: firstNonBlank(student.feeStatus, 'Pending'),
      feeDue: Number(student.feeDue || 0)
    })),
    receipts
  };
}

export async function payFee(payload) {
  const student = await requireStudent(payload.studentId);
  const amount = Number(payload.amount || 0);
  const remaining = Math.max(Number(student.feeDue || 0) - amount, 0);
  await updateNode(`students/${student.studentId}`, {
    feeDue: remaining,
    feeStatus: remaining === 0 ? 'Paid' : 'Pending'
  });
  const receiptId = await nextCode('feeReceipts', 'RCPT');
  const receipt = {
    receiptId,
    studentId: student.studentId,
    studentName: student.name,
    amount,
    mode: firstNonBlank(payload.mode, 'Online'),
    date: today()
  };
  await setNode(`feeReceipts/${receiptId}`, receipt);
  return receipt;
}

export async function getNotices() {
  return values('notices', 'noticeId', true);
}

export async function addNotice(payload) {
  const noticeId = firstNonBlank(payload.noticeId, await nextCode('notices', 'NT'));
  const record = {
    noticeId,
    title: firstNonBlank(payload.title, 'Untitled Notice'),
    category: firstNonBlank(payload.category, 'General'),
    priority: firstNonBlank(payload.priority, 'Medium'),
    date: firstNonBlank(payload.date, today()),
    message: firstNonBlank(payload.message, '')
  };
  await setNode(`notices/${noticeId}`, record);
  return record;
}

export async function getCommunications() {
  return {
    notices: await getNotices(),
    events: await values('events', 'eventId', true)
  };
}

export async function addEvent(payload) {
  const eventId = firstNonBlank(payload.eventId, await nextCode('events', 'EV'));
  const record = {
    eventId,
    title: firstNonBlank(payload.title, 'Untitled Event'),
    category: firstNonBlank(payload.category, 'Campus'),
    date: firstNonBlank(payload.date, today()),
    venue: firstNonBlank(payload.venue, 'Main Campus'),
    message: firstNonBlank(payload.message, '')
  };
  await setNode(`events/${eventId}`, record);
  return record;
}

export async function getLibraryBooks() {
  return values('library', 'bookId');
}

export async function addLibraryBook(payload) {
  const bookId = firstNonBlank(payload.bookId, await nextCode('library', 'BK'));
  const record = {
    bookId,
    title: firstNonBlank(payload.title, 'Untitled Book'),
    author: firstNonBlank(payload.author, 'Unknown'),
    status: 'Available',
    borrower: 'None',
    dueDate: '-',
    fine: Number(payload.fine || 0)
  };
  await setNode(`library/${bookId}`, record);
  return record;
}

export async function issueBook(payload) {
  const book = await requireBook(payload.bookId);
  const borrower = firstNonBlank(payload.borrower, 'Unknown');
  const dueDate = firstNonBlank(payload.dueDate, today());
  await updateNode(`library/${book.bookId}`, {
    status: 'Issued',
    borrower,
    dueDate
  });
  return { ...book, status: 'Issued', borrower, dueDate };
}

export async function returnBook(payload) {
  const book = await requireBook(payload.bookId);
  const fine = Number(payload.fine || 0);
  await updateNode(`library/${book.bookId}`, {
    status: 'Available',
    borrower: 'None',
    dueDate: '-',
    fine
  });
  return { ...book, status: 'Available', borrower: 'None', dueDate: '-', fine };
}

export async function getAdminAnalytics() {
  const [students, faculty, notices, library] = await Promise.all([
    getStudents(),
    getFaculty(),
    getNotices(),
    getLibraryBooks()
  ]);

  const paidFees = students.filter((student) => firstNonBlank(student.feeStatus, 'Pending') === 'Paid').length;
  const pendingFees = students.length - paidFees;
  const averageAttendance = round(students.length
    ? students.reduce((sum, student) => sum + Number(student.attendance || 0), 0) / students.length
    : 0);
  const averageCgpa = round(students.length
    ? students.reduce((sum, student) => sum + Number(student.cgpa || 0), 0) / students.length
    : 0);
  const booksIssued = library.filter((book) => book.status === 'Issued').length;

  return {
    totalStudents: students.length,
    totalFaculty: faculty.length,
    paidFees,
    pendingFees,
    averageAttendance,
    averageCgpa,
    activeNotices: notices.length,
    booksIssued,
    totalLibraryBooks: library.length
  };
}

export async function chatbot(payload) {
  const question = firstNonBlank(payload.question, '').toLowerCase();
  if (question.includes('exam')) {
    const exams = await getExams();
    if (!exams.length) {
      return answer(payload.question, 'No exams have been scheduled yet.');
    }
    return answer(payload.question, `The next recorded exam is ${exams[0].course} on ${exams[0].date} during ${exams[0].slot}.`);
  }

  if (question.includes('attendance')) {
    const students = await getStudents();
    if (!students.length) {
      return answer(payload.question, 'No student attendance records are available yet.');
    }
    return answer(payload.question, `${students[0].name} currently has ${students[0].attendance || 0}% attendance.`);
  }

  if (question.includes('fee')) {
    const fees = await getFeeSummary();
    const pending = fees.statuses.find((entry) => entry.feeStatus !== 'Paid');
    return answer(payload.question, pending
      ? `${pending.studentName} has pending fees of Rs. ${pending.feeDue}.`
      : 'All current fee records are marked paid.');
  }

  return answer(payload.question, 'Aurora Campus AI can answer using Firebase-backed attendance, exam, fee, notice, schedule, and library data.');
}

async function buildSession(user) {
  const profile = (await readNode(`users/${user.uid}`)) || {};
  return {
    uid: user.uid,
    email: user.email,
    name: firstNonBlank(profile.name, user.email ? user.email.split('@')[0] : 'User'),
    role: normalizeRole(profile.role || 'student'),
    studentId: profile.studentId || '',
    facultyId: profile.facultyId || ''
  };
}

async function requireStudent(studentId) {
  const student = await readNode(`students/${studentId}`);
  if (!student) throw new Error(`Student not found: ${studentId}`);
  return student;
}

async function requireBook(bookId) {
  const book = await readNode(`library/${bookId}`);
  if (!book) throw new Error(`Book not found: ${bookId}`);
  return book;
}

async function readNode(path) {
  const snapshot = await get(ref(db, fullPath(path)));
  return snapshot.exists() ? snapshot.val() : null;
}

async function setNode(path, value) {
  await set(ref(db, fullPath(path)), value);
}

async function updateNode(path, value) {
  await update(ref(db, fullPath(path)), value);
}

async function removeNode(path) {
  await remove(ref(db, fullPath(path)));
}

async function values(path, idField, newestFirst = false) {
  const data = (await readNode(path)) || {};
  const items = Object.entries(data).map(([key, value]) => ({
    [idField]: value[idField] || key,
    ...value
  }));
  items.sort((left, right) => {
    const leftKey = String(left[idField] || '');
    const rightKey = String(right[idField] || '');
    return newestFirst ? rightKey.localeCompare(leftKey) : leftKey.localeCompare(rightKey);
  });
  return items;
}

async function nextCode(path, prefix) {
  const data = (await readNode(path)) || {};
  const count = Object.keys(data).length + 1;
  return `${prefix}${String(count).padStart(3, '0')}`;
}

function metric(label, value, description) {
  return { label, value, description };
}

function module(title, description) {
  return { title, description };
}

function answer(question, text) {
  return { question, answer: text };
}

function fullPath(path) {
  return `${ROOT}/${path}`;
}

function normalizeRole(role) {
  const normalized = String(role || 'student').toLowerCase();
  return ['student', 'faculty', 'admin'].includes(normalized) ? normalized : 'student';
}

function firstNonBlank(value, fallback) {
  const text = String(value || '').trim();
  return text || fallback;
}

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'record';
}

function round(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
