const state = {
    students: [],
    filteredStudents: []
};

const totalStudents = document.getElementById("totalStudents");
const averageMarks = document.getElementById("averageMarks");
const passPercentage = document.getElementById("passPercentage");
const topStudent = document.getElementById("topStudent");

const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const sortSelect = document.getElementById("sortSelect");

const studentTable = document.getElementById("studentTable");
const leaderboard = document.getElementById("leaderboard");
const chart = document.getElementById("chart");

const resultCount = document.getElementById("resultCount");
const noResults = document.getElementById("noResults");

const themeBtn = document.getElementById("themeBtn");


async function loadData() {

    try {

        const response = await fetch("data.json");

        if (!response.ok) {
            throw new Error("Unable to load data");
        }

        state.students = await response.json();

        state.filteredStudents = [...state.students];

        updateDashboard();

    } catch (error) {

        console.error(error);

        studentTable.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load student data.
                </td>
            </tr>
        `;
    }
}


function calculateAverage(student) {

    return Math.round(
        (student.java + student.python + student.database) / 3
    );
}


function updateDashboard() {

    updateStats();
    applyFilters();
    updateChart();
    updateLeaderboard();
}


function updateStats() {

    const students = state.students;

    if (students.length === 0) {
        return;
    }

    const averages = students.map(calculateAverage);

    const totalAverage = Math.round(
        averages.reduce((sum, value) => sum + value, 0) / averages.length
    );

    const passed = averages.filter(mark => mark >= 40).length;

    const highest = Math.max(...averages);

    const top = students.find(
        student => calculateAverage(student) === highest
    );

    totalStudents.textContent = students.length;
    averageMarks.textContent = `${totalAverage}%`;
    passPercentage.textContent =
        `${Math.round((passed / students.length) * 100)}%`;

    topStudent.textContent = top ? top.name.split(" ")[0] : "-";
}


function applyFilters() {

    const searchValue = searchInput.value.toLowerCase().trim();
    const selectedCourse = courseFilter.value;
    const selectedSort = sortSelect.value;

    let results = state.students.filter(student => {

        const matchesName =
            student.name.toLowerCase().includes(searchValue);

        const matchesCourse =
            selectedCourse === "all" ||
            student.course === selectedCourse;

        return matchesName && matchesCourse;
    });


    if (selectedSort === "name") {

        results.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    } else if (selectedSort === "marks-high") {

        results.sort((a, b) =>
            calculateAverage(b) - calculateAverage(a)
        );

    } else if (selectedSort === "marks-low") {

        results.sort((a, b) =>
            calculateAverage(a) - calculateAverage(b)
        );
    }


    state.filteredStudents = results;

    renderTable();

    resultCount.textContent =
        `${results.length} student${results.length !== 1 ? "s" : ""}`;

    noResults.hidden = results.length !== 0;
}


function renderTable() {

    studentTable.innerHTML = "";

    state.filteredStudents.forEach(student => {

        const average = calculateAverage(student);

        const status = average >= 40 ? "Pass" : "Fail";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>${student.name}</strong></td>
            <td>${student.course}</td>
            <td>${student.java}%</td>
            <td>${student.python}%</td>
            <td>${student.database}%</td>
            <td><strong>${average}%</strong></td>
            <td>
                <span class="status ${status === "Pass" ? "pass" : "fail"}">
                    ${status}
                </span>
            </td>
        `;

        studentTable.appendChild(row);
    });
}


function updateChart() {

    if (state.students.length === 0) {
        return;
    }

    const javaAverage = getSubjectAverage("java");
    const pythonAverage = getSubjectAverage("python");
    const databaseAverage = getSubjectAverage("database");

    const subjects = [
        {
            name: "Java",
            value: javaAverage
        },
        {
            name: "Python",
            value: pythonAverage
        },
        {
            name: "Database",
            value: databaseAverage
        }
    ];

    chart.innerHTML = "";

    subjects.forEach(subject => {

        const container = document.createElement("div");

        container.className = "bar-container";

        container.innerHTML = `
            <span class="bar-value">${subject.value}%</span>

            <div
                class="bar"
                style="height: ${subject.value * 1.8}px"
                aria-label="${subject.name} average ${subject.value}%">
            </div>

            <span class="bar-label">
                ${subject.name}
            </span>
        `;

        chart.appendChild(container);
    });
}


function getSubjectAverage(subject) {

    const total = state.students.reduce(
        (sum, student) => sum + student[subject],
        0
    );

    return Math.round(total / state.students.length);
}


function updateLeaderboard() {

    const topStudents = [...state.students]
        .sort(
            (a, b) =>
                calculateAverage(b) - calculateAverage(a)
        )
        .slice(0, 5);

    leaderboard.innerHTML = "";

    topStudents.forEach((student, index) => {

        const item = document.createElement("div");

        item.className = "leader-item";

        item.innerHTML = `
            <span class="rank">${index + 1}</span>

            <div class="leader-info">
                <strong>${student.name}</strong>
                <span>${student.course}</span>
            </div>

            <span class="leader-score">
                ${calculateAverage(student)}%
            </span>
        `;

        leaderboard.appendChild(item);
    });
}


searchInput.addEventListener("input", applyFilters);

courseFilter.addEventListener("change", applyFilters);

sortSelect.addEventListener("change", applyFilters);


themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");

    themeBtn.textContent =
        darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
});


loadData();