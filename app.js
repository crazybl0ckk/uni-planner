// ---------- COURSES ----------
const courses = [
  { code: "STTPK2023", name: "Advanced Programming" },
  { code: "STTNK2013", name: "Artificial Intelligence" },
  { code: "STTPK2013", name: "Data Structure" },
  { code: "STTDK2013", name: "Database Management System" },
  { code: "SQQSK1013", name: "Elementary Statistics" },
  { code: "MPU1022", name: "Penghayatan Etika dan Peradaban" },
  { code: "STTPK2033", name: "Software Development Process" }
];

function fillCourseDropdowns() {
  ["course", "examCourse", "classCourse"].forEach(id => {
    const select = document.getElementById(id);
    courses.forEach(c => {
      const option = document.createElement("option");
      option.value = c.code;
      option.textContent = `${c.code} - ${c.name}`;
      select.appendChild(option);
    });
  });
}

fillCourseDropdowns();

// ---------- SHARED HELPER ----------
function daysLeft(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

// ---------- ASSIGNMENTS ----------
let assignments = JSON.parse(localStorage.getItem("assignments")) || [];

const form = document.getElementById("form");
const list = document.getElementById("list");
let editingId = null;

function save() {
  localStorage.setItem("assignments", JSON.stringify(assignments));
}

function render() {
  list.innerHTML = "";
  assignments.sort((a, b) => a.due.localeCompare(b.due));
  assignments.forEach(a => {
    const li = document.createElement("li");
    const d = daysLeft(a.due);
    const label = d < 0 ? "overdue" : d === 0 ? "due today" : `${d} days left`;
    li.textContent = `${a.course} - ${a.title} (due ${a.due}) [${label}]`;
    if (a.done) li.classList.add("done");
    if (d < 0 && !a.done) li.classList.add("overdue");
    li.onclick = () => { a.done = !a.done; save(); render(); };
    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.className = "edit";
    edit.onclick = (e) => {
      e.stopPropagation();
      document.getElementById("title").value = a.title;
      document.getElementById("course").value = a.course;
      document.getElementById("due").value = a.due;
      editingId = a.id;
      form.querySelector("button").textContent = "Save";
    };
    li.appendChild(edit);
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = (e) => {
      e.stopPropagation();
      if (editingExamId === ex.id) {
        editingExamId = null;
        examForm.reset();
        examForm.querySelector("button").textContent = "Add";
      }
      assignments = assignments.filter(item => item.id !== a.id);
      save();
      render();
    };
    li.appendChild(del);
    list.appendChild(li);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const course = document.getElementById("course").value;
  const due = document.getElementById("due").value;

  if (editingId) {
    const a = assignments.find(item => item.id === editingId);
    a.title = title;
    a.course = course;
    a.due = due;
    editingId = null;
    form.querySelector("button").textContent = "Add";
  } else {
    assignments.push({ id: Date.now(), title, course, due, done: false });
  }

  save();
  render();
  form.reset();
});

render();

// ---------- EXAMS ----------
let exams = JSON.parse(localStorage.getItem("exams")) || [];

const examForm = document.getElementById("examForm");
const examList = document.getElementById("examList");
let editingExamId = null;

function saveExams() {
  localStorage.setItem("exams", JSON.stringify(exams));
}

function renderExams() {
  examList.innerHTML = "";
  exams.sort((a, b) => a.date.localeCompare(b.date));
  exams.forEach(ex => {
    const li = document.createElement("li");
    const d = daysLeft(ex.date);
    const label = d < 0 ? "finished" : d === 0 ? "TODAY!" : `${d} days left`;
    li.textContent = `${ex.course} - ${ex.date} ${ex.time ? ex.time + " " : ""}@ ${ex.venue} (${label})`;

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.className = "edit";
    edit.onclick = () => {
      document.getElementById("examCourse").value = ex.course;
      document.getElementById("examDate").value = ex.date;
      document.getElementById("examTime").value = ex.time;
      document.getElementById("examVenue").value = ex.venue;
      editingExamId = ex.id;
      examForm.querySelector("button").textContent = "Save";
    };
    li.appendChild(edit);

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = () => {
      if (editingExamId === ex.id) {
        editingExamId = null;
        examForm.reset();
        examForm.querySelector("button").textContent = "Add";
      }
      exams = exams.filter(item => item.id !== ex.id);
      saveExams();
      renderExams();
    };
    li.appendChild(del);

    examList.appendChild(li);
  });
}

examForm.addEventListener("submit", e => {
  e.preventDefault();

  const course = document.getElementById("examCourse").value;
  const date = document.getElementById("examDate").value;
  const time = document.getElementById("examTime").value;
  const venue = document.getElementById("examVenue").value;

  if (editingExamId) {
    const ex = exams.find(item => item.id === editingExamId);
    ex.course = course;
    ex.date = date;
    ex.time = time;
    ex.venue = venue;
    editingExamId = null;
    examForm.querySelector("button").textContent = "Add";
  } else {
    exams.push({ id: Date.now(), course, date, time, venue });
  }

  saveExams();
  renderExams();
  examForm.reset();
});

renderExams();

// ---------- TIMETABLE ----------
let classes = JSON.parse(localStorage.getItem("classes")) || [];

const classForm = document.getElementById("classForm");
const timetable = document.getElementById("timetable");
let editingClassId = null;
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function saveClasses() {
  localStorage.setItem("classes", JSON.stringify(classes));
}

function renderTimetable() {
  timetable.innerHTML = "";
  days.forEach(day => {
    const heading = document.createElement("h3");
    heading.textContent = day;
    timetable.appendChild(heading);

    const todays = classes
      .filter(c => c.day === day)
      .sort((a, b) => a.start.localeCompare(b.start));

    if (todays.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No classes";
      timetable.appendChild(empty);
    }

    todays.forEach(c => {
      const p = document.createElement("p");
      const course = courses.find(co => co.code === c.course);
      p.textContent = `${c.start}-${c.end}  ${c.course} ${course ? `- ${course.name}` : ""} @ ${c.room} `;

      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.className = "edit";
      edit.onclick = () => {
        document.getElementById("classCourse").value = c.course;
        document.getElementById("classDay").value = c.day;
        document.getElementById("classStart").value = c.start;
        document.getElementById("classEnd").value = c.end;
        document.getElementById("classRoom").value = c.room;
        editingClassId = c.id;
        classForm.querySelector("button").textContent = "Save";
      };
      p.appendChild(edit);

      const del = document.createElement("button");
      del.textContent = "Delete";
      del.onclick = () => {
        if (editingClassId === c.id) {
          editingClassId = null;
          classForm.reset();
          classForm.querySelector("button").textContent = "Add";
        }
        classes = classes.filter(item => item.id !== c.id);
        saveClasses();
        renderTimetable();
      };
      p.appendChild(del);

      timetable.appendChild(p);
    });
  });

  renderToday();
}

function renderToday() {
  const todayDiv = document.getElementById("today");
  todayDiv.innerHTML = "";

  const todayName = dayNames[new Date().getDay()];

  const heading = document.createElement("h3");
  heading.textContent = todayName;
  todayDiv.appendChild(heading);

  const todays = classes
    .filter(c => c.day === todayName)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (todays.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No classes today";
    todayDiv.appendChild(empty);
  }

  todays.forEach(c => {
    const p = document.createElement("p");
    const course = courses.find(co => co.code === c.course);
    p.textContent = `${c.start}-${c.end}  ${c.course} ${course ? `- ${course.name}` : ""} @ ${c.room}`;
    todayDiv.appendChild(p);
  });
}

classForm.addEventListener("submit", e => {
  e.preventDefault();

  const course = document.getElementById("classCourse").value;
  const day = document.getElementById("classDay").value;
  const start = document.getElementById("classStart").value;
  const end = document.getElementById("classEnd").value;
  const room = document.getElementById("classRoom").value;

  if (editingClassId) {
    const c = classes.find(item => item.id === editingClassId);
    c.course = course;
    c.day = day;
    c.start = start;
    c.end = end;
    c.room = room;
    editingClassId = null;
    classForm.querySelector("button").textContent = "Add";
  } else {
    classes.push({ id: Date.now(), course, day, start, end, room });
  }

  saveClasses();
  renderTimetable();
  classForm.reset();
});

renderTimetable();