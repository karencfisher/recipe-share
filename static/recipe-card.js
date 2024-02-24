document.getElementById("back-button").addEventListener("click", () => {
    history.back();
});


function toggleTheme(obj) {
    if (obj.checked) {
        document.body.style.setProperty("--background-color", "rgb(20, 20, 20)");
        document.body.style.setProperty("--widget-background-color", "rgb(50, 50, 50)");
        document.body.style.setProperty("--widget-focus-background-color", "rgb(29, 36, 122)");
        document.body.style.setProperty("--border-color", "rgb(124, 250, 250)");
        document.body.style.setProperty("--font-color", "rgb(124, 250, 250)");
        displayMessage("Dark mode enabled", false);
    }
    else {
        document.body.style.setProperty("--background-color", "rgb(255, 255, 255)");
        document.body.style.setProperty("--widget-background-color", "rgb(230, 213, 213)");
        document.body.style.setProperty("--widget-focus-background-color", "rgb(238, 193, 97)");
        document.body.style.setProperty("--border-color", "rgb(124, 15, 15)");
        document.body.style.setProperty("--font-color", "rgb(124, 15, 15)");
        displayMessage("Light mode enabled", false);
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
