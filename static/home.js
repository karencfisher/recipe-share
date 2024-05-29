function loadRecipes(container, data) {
    const contain = document.getElementById(container);
    contain.innerHTML = "";
    data.forEach((item) => {
        element = document.createElement("div");
        element.classList.add("link");
        const titleWords = item.title.split(" ");

        let title = "";
        if (titleWords.length > 7) {
            title = titleWords.slice(0, 7).join(" ") + "...";
        }
        else {
            title = titleWords.join(" ");
        }

        html = `<a href=\"/display?id=${item.id}\">${title}</a>`
        element.innerHTML = html;
        element.querySelector("a").addEventListener("click", (e) => {
            e.preventDefault();
            const uri = e.target.getAttribute("href") + `&mode=${document.body.className}`
            location.href = uri;
        });
        contain.appendChild(element);
    });
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

async function semanticSearch() {
    try {
        const response = await fetch(`/search?method=semantic&query=${searchText.value}&max_found=10`, 
        {
            method: 'GET'
        });
        const data = await response.json();
        loadRecipes("results", data);
    } catch (error) {
        displayError('error', 'Network or other error');
    }
}

async function updateContribs() {
    try {
        const response = await fetch("/search?method=contribs", {
            method: 'GET'
        });
        const data = await response.json();
        if (data.length > 0) {
            loadRecipes("user-contributions", data);
        }
    } catch (error) {
        displayError('error', 'Network or other error');
    }
}

searchButton.addEventListener("click", () => {
    semanticSearch();
});

searchText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        semanticSearch();
    }
});

const contributeButton = document.getElementById("contribute-button");
contributeButton.addEventListener("click", () =>{
    location.href = `/edit?mode=${document.body.className}`
});

function toggleTheme(obj) {
    if (obj.checked) {
        document.body.setAttribute("class", "dark-mode");
        update_theme('dark-mode');
    }
    else {
        document.body.setAttribute("class", "light-mode");
        update_theme('light-mode');
    }
}

async function update_theme(theme) {
    url = `/update_state?mode=${theme}`;
    result = await fetch(url);
    if (result.status !== 200) {
        displayError('error', 'Network error')
    }
}

const theme = document.getElementById("darkmode"); 
theme.addEventListener("focus", () => {
    document.getElementById("theme").style.setProperty("background", "var(--widget-focus-background-color)");
});

theme.addEventListener("blur", () => {
    document.getElementById("theme").style.setProperty("background", "var(--widget-background-color)");
});

theme.addEventListener("click", () => {
    toggleTheme(theme);
});

theme.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        theme.checked = !theme.checked;
        toggleTheme(theme);
    }
    else if (e.code === "Space") {
        toggleTheme(theme);
    }
});

const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", async () => {
    result = await fetch("/logout");
    window.location.href = result.url;
});

const notmeButton = document.getElementById("notyou-button");
notmeButton.addEventListener("click", async () => {
    result = await fetch("/logout");
    window.location.href = result.url;
});

function displayError(type, msg) {
    const errorMsg = document.getElementById("error-msg");
    const errortxt = document.getElementById("error-txt");
    const msgIcon = document.getElementById("msg-icon");
    if (type === "info") {
        msgIcon.innerText = "info";
    }
    else {
        msgIcon.innerText = "error_outline";
    }

    errortxt.innerText = msg;
    errorMsg.dataset.open = "true";

    setTimeout(() => {
        errorMsg.dataset.open = "false";
    }, 2000);
}

window.addEventListener("load", () => { 
    const pick = Math.floor(Math.random() * 10);
    const img = `url(static/background-images/food${pick}.jpg)`
    document.body.style.setProperty("background-image", img);

    if (document.body.className === "dark-mode") {
        theme.checked = true;
    }
});

