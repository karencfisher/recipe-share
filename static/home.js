function loadRecipes(container, data) {
    const contain = document.getElementById(container);
    contain.innerHTML = "";
    data.forEach((item) => {
        element = document.createElement("div");
        element.classList.add("link");
        html = `<a href=\"/search?id=${item.id}\">${item.title}</a>`;
        element.innerHTML = html;
        element.querySelector("a").addEventListener("click", (e) => {
            e.preventDefault();
            const uri = e.target.getAttribute("href") + `&mode=${document.body.className}`
            location.href = uri;
        });
        contain.appendChild(element);
    });
}

addEventListener("load", () => {
    fetch("/search?method=views&max_found=5", {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => loadRecipes("views", data))
    .catch(error => console.error('Error:', error));

    fetch("/search?method=recent&max_found=5", {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => loadRecipes("recent", data))
    .catch(error => console.error('Error:', error));
});

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    fetch(`/search?method=semantic&query=${searchText.value}&max_found=5`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => loadRecipes("results", data))
    .catch(error => console.error('Error:', error));
});

searchText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        fetch(`/search?method=semantic&query=${searchText.value}&max_found=5`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => loadRecipes("results", data))
        .catch(error => console.error('Error:', error));
    }
});

const links = [...document.getElementsByTagName("a")];
links.forEach((item) => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        let uri = e.target.getAttribute("href")
        if (e.target.id === "contribute") {
             uri += "?";
        }
        else {
            uri += "&";
        }
        uri += `mode=${document.body.className}`
        location.href = uri;
    });
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