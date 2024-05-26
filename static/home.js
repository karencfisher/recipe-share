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

        html = `<a href=\"/display?id=${item.id}\">${title}</a><br /> 
            <span id="views">${item.views} views</span>`;
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

searchButton.addEventListener("click", () => {
    fetch(`/search?method=semantic&query=${searchText.value}&max_found=10`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => loadRecipes("results", data))
    .catch(error => console.error('Error:', error));
});

searchText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        fetch(`/search?method=semantic&query=${searchText.value}&max_found=10`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => loadRecipes("results", data))
        .catch(error => console.error('Error:', error));
    }
});

const contributeButton = document.getElementById("contribute-button");
contributeButton.addEventListener("click", () =>{
    location.href = `/edit?mode=${document.body.className}`
});

function toggleTheme(obj) {
    if (obj.checked) {
        document.body.setAttribute("class", "dark-mode");
    }
    else {
        document.body.setAttribute("class", "light-mode");
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
