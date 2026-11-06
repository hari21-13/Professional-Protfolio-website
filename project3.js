
// ==========================================
// K HARIKA PORTFOLIO - JAVASCRIPT
// ==========================================

// DEMO ADMIN CREDENTIALS
// Frontend-only demonstration. Not production security.
const ADMIN_EMAIL = "admin@portfolio.com";
const ADMIN_PASSWORD = "Admin@123";

// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPage(page) {
    const portfolio = document.getElementById("portfolio");
    const login = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboardPage");

    portfolio.classList.toggle("hidden", page !== "portfolio");
    login.classList.toggle("hidden", page !== "login");
    dashboard.classList.toggle("hidden", page !== "dashboard");

    if (page === "dashboard") {
        if (sessionStorage.getItem("adminLoggedIn") !== "true") {
            showPage("login");
            return;
        }
        renderVisitors();
    }

    window.scrollTo(0, 0);
}

// ==========================================
// ADMIN LOGIN
// ==========================================

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;
    const error = document.getElementById("loginError");

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {

        sessionStorage.setItem("adminLoggedIn", "true");

        error.textContent = "";

        showPage("dashboard");

    } else {

        error.textContent = "Invalid email or password. Please try again.";

    }
});

// SHOW / HIDE PASSWORD

function togglePassword() {

    const password = document.getElementById("adminPassword");
    const icon = document.getElementById("eyeIcon");

    if (password.type === "password") {

        password.type = "text";
        icon.className = "fas fa-eye-slash";

    } else {

        password.type = "password";
        icon.className = "fas fa-eye";

    }
}

// LOGOUT

function logout() {

    sessionStorage.removeItem("adminLoggedIn");

    document.getElementById("adminEmail").value = "";
    document.getElementById("adminPassword").value = "";

    showPage("login");

}

// ==========================================
// VISITOR MANAGEMENT
// ==========================================

// Persistent browser-specific visitor ID

function getVisitorID() {

    let id = localStorage.getItem("portfolioVisitorID");

    if (!id) {

        id = "VIS-" + Math.random().toString(36).substring(2, 10).toUpperCase();

        localStorage.setItem("portfolioVisitorID", id);

    }

    return id;
}

// GET BROWSER

function getBrowser() {

    const ua = navigator.userAgent;

    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Chrome/")) return "Chrome";
    if (ua.includes("Safari/")) return "Safari";

    return "Other";
}

// GET OPERATING SYSTEM

function getOS() {

    const ua = navigator.userAgent;

    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";

    return "Other";
}

// GET DEVICE

function getDevice() {

    return /Mobi|Android|iPhone/i.test(navigator.userAgent)
        ? "Mobile"
        : "Desktop";

}

// RECORD VISITOR

function recordVisitor() {

    // One record per browser session
    if (sessionStorage.getItem("visitorRecorded")) return;

    let visitors = JSON.parse(
        localStorage.getItem("portfolioVisitors") || "[]"
    );

    const now = new Date();

    let referrer = "Direct";

    if (document.referrer) {

        try {
            referrer = new URL(document.referrer).hostname;
        } catch {
            referrer = "Unknown";
        }

    }

    const visitor = {

        id: getVisitorID(),

        date: now.getFullYear() + "-" +
              String(now.getMonth() + 1).padStart(2, "0") + "-" +
              String(now.getDate()).padStart(2, "0"),

        time: now.toLocaleTimeString(),

        country: "Not collected",

        browser: getBrowser(),

        device: getDevice(),

        os: getOS(),

        referrer: referrer

    };

    visitors.unshift(visitor);

    localStorage.setItem(
        "portfolioVisitors",
        JSON.stringify(visitors)
    );

    sessionStorage.setItem("visitorRecorded", "true");

}

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function renderVisitors() {

    const visitors = JSON.parse(
        localStorage.getItem("portfolioVisitors") || "[]"
    );

    const today = new Date().toISOString().slice(0, 10);

    const total = visitors.length;

    const todayCount = visitors.filter(
        v => v.date === today
    ).length;

    const unique = new Set(
        visitors.map(v => v.id)
    ).size;

    document.getElementById("totalVisitors").textContent = total;

    document.getElementById("todayVisitors").textContent = todayCount;

    document.getElementById("uniqueVisitors").textContent = unique;

    // SEARCH

    const search = document.getElementById("visitorSearch")
        .value.toLowerCase();

    const date = document.getElementById("visitorDate").value;

    const sort = document.getElementById("visitorSort").value;

    let filtered = visitors.filter(v => {

        const content = Object.values(v)
            .join(" ")
            .toLowerCase();

        return content.includes(search) &&
               (!date || v.date === date);

    });

    // SORT

    filtered.sort((a, b) => {

        const A = a.date + " " + a.time;
        const B = b.date + " " + b.time;

        return sort === "newest"
            ? B.localeCompare(A)
            : A.localeCompare(B);

    });

    // DISPLAY

    const tbody = document.getElementById("visitorTable");

    tbody.innerHTML = filtered.map((v, i) => `

        <tr>

            <td>${i + 1}</td>

            <td>${escapeHTML(v.id)}</td>

            <td>${escapeHTML(v.date)}</td>

            <td>${escapeHTML(v.time)}</td>

            <td>${escapeHTML(v.country)}</td>

            <td>${escapeHTML(v.browser)}</td>

            <td>${escapeHTML(v.device)}</td>

            <td>${escapeHTML(v.os)}</td>

            <td>${escapeHTML(v.referrer)}</td>

        </tr>

    `).join("");

    if (filtered.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    No visitor records found.
                </td>
            </tr>
        `;

    }

}

// PREVENT HTML INJECTION IN TABLE

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    }[char]));

}

// CLEAR FILTERS

function clearFilters() {

    document.getElementById("visitorSearch").value = "";

    document.getElementById("visitorDate").value = "";

    document.getElementById("visitorSort").value = "newest";

    renderVisitors();

}

// ==========================================
// EXPORT CSV
// ==========================================

function getExportData() {

    const visitors = JSON.parse(
        localStorage.getItem("portfolioVisitors") || "[]"
    );

    return [

        [
            "S.No",
            "Visitor ID",
            "Date",
            "Time",
            "Country",
            "Browser",
            "Device",
            "Operating System",
            "Referrer"
        ],

        ...visitors.map((v, i) => [

            i + 1,
            v.id,
            v.date,
            v.time,
            v.country,
            v.browser,
            v.device,
            v.os,
            v.referrer

        ])

    ];

}

function downloadFile(content, type, filename) {

    const blob = new Blob([content], { type });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    link.click();

    URL.revokeObjectURL(url);

}

function exportCSV() {

    const data = getExportData();

    const csv = data.map(row =>

        row.map(value =>
            '"' + String(value).replace(/"/g, '""') + '"'
        ).join(",")

    ).join("\r\n");

    downloadFile(
        "\uFEFF" + csv,
        "text/csv;charset=utf-8",
        "Harika-Visitor-Records.csv"
    );

}

// ==========================================
// EXPORT EXCEL
// ==========================================

function exportExcel() {

    const data = getExportData();

    const rows = data.map(row =>

        "<tr>" +

        row.map(value =>
            "<td>" + escapeHTML(value) + "</td>"
        ).join("") +

        "</tr>"

    ).join("");

    const excel = `

        <html>

        <head>
            <meta charset="UTF-8">
        </head>

        <body>

            <table border="1">

                ${rows}

            </table>

        </body>

        </html>

    `;

    downloadFile(
        "\uFEFF" + excel,
        "application/vnd.ms-excel",
        "Harika-Visitor-Records.xls"
    );

}

// ==========================================
// DARK / LIGHT MODE
// ==========================================

function toggleTheme() {

    document.body.classList.toggle("light");

    const light = document.body.classList.contains("light");

    document.getElementById("themeIcon").className =
        light ? "fas fa-sun" : "fas fa-moon";

    localStorage.setItem("portfolioTheme", light ? "light" : "dark");

}

// RESTORE THEME

if (localStorage.getItem("portfolioTheme") === "light") {

    document.body.classList.add("light");

    document.getElementById("themeIcon").className = "fas fa-sun";

}

// ==========================================
// TYPING ANIMATION
// ==========================================

const typingWords = [
    "Frontend Developer",
    "Java Developer",
    "Full Stack Developer",
    "Problem Solver"
];

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function typingEffect() {

    const element = document.getElementById("typing");

    const word = typingWords[wordIndex];

    element.textContent = word.substring(0, charIndex);

    if (!deleting && charIndex < word.length) {

        charIndex++;

        setTimeout(typingEffect, 100);

    } else if (deleting && charIndex > 0) {

        charIndex--;

        setTimeout(typingEffect, 50);

    } else {

        deleting = !deleting;

        if (!deleting) {

            wordIndex = (wordIndex + 1) % typingWords.length;

        }

        setTimeout(typingEffect, 700);

    }

}

typingEffect();

// ==========================================
// SCROLL REVEAL ANIMATION
// ==========================================

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("active");

            observer.unobserve(entry.target);

        }

    });

}, { threshold: 0.12 });

document.querySelectorAll(
    ".section-heading, .glass-card, .hero .reveal"
).forEach(element => {

    element.classList.add("reveal");

    observer.observe(element);

});

// ==========================================
// BACK TO TOP BUTTON
// ==========================================

window.addEventListener("scroll", () => {

    const button = document.getElementById("topBtn");

    button.style.display =
        window.scrollY > 300 ? "block" : "none";

});

// ==========================================
// CONTACT FORM
// ==========================================

document.getElementById("contactForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const name = document.getElementById("contactName").value.trim();

    const email = document.getElementById("contactEmail").value.trim();

    const subject = document.getElementById("contactSubject").value.trim();

    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !subject || !message) return;

    const mailto = "mailto:harikabhargav11@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(
            "Name: " + name +
            "\nEmail: " + email +
            "\n\nMessage:\n" + message
        );

    document.getElementById("contactStatus").textContent =
        "Opening your email application...";

    window.location.href = mailto;

});

// ==========================================
// RECORD VISITOR
// ==========================================

recordVisitor();

// Refresh dashboard when a different browser taba
// updates the same local visitor storage.

window.addEventListener("storage", event => {

    if (event.key === "portfolioVisitors" &&
        sessionStorage.getItem("adminLoggedIn") === "true") {

        renderVisitors();

    }

});
