/* initially focus on title field ****************/
const titleText = document.getElementById("title");
titleText.focus();

/* Add/remove items ******************************/
function additem(htmlString, itemClass, parent) {
    if (htmlString === "") {
        displayMessage(`Text field for ${itemClass} must not be empty!`, true);
        parent.previousElementSibling.firstElementChild.focus();
        return;
    }
    // create new element
    const item = document.createElement("div");
    item.innerHTML = htmlString;

    // set attributes
    item.classList.add(itemClass);
    item.setAttribute("tabindex", "0");

    // add event listeners to delete (click or space)
    item.addEventListener("click", (e) => {
        item.remove();
        const countItems = parent.querySelectorAll("div").length;
        displayMessage(`${htmlString} removed ${countItems} ${itemClass}s remaining`, false);
        parent.previousElementSibling.firstElementChild.focus();
    });

    item.addEventListener("keypress", (e) => {
        // space bar to remove, enter to undo add
        if (e.code === "Space") {
            item.remove();
            const countItems = parent.querySelectorAll("div").length;
            displayMessage(`${htmlString} removed ${countItems} ${itemClass}s remaining`, false);
            parent.previousElementSibling.firstElementChild.focus();
        }
    });

    // Add to parent
    parent.appendChild(item);
    const countItems = parent.querySelectorAll("div").length;
    displayMessage(`${htmlString} added to total ${countItems} ${itemClass}s`, false);             
}

const ingredientButton = document.getElementById("add-ingredient");
const ingredientText = document.getElementById("ingredient");
const ingredientList = document.getElementById("ingredient-container");

titleText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        if (e.target.value === "") {
            displayMessage("Title field must not be empty!", true);
        }
        else {
            displayMessage(`Title ${e.target.value} added`, false)
            ingredientText.focus();
        }
    }
});

ingredientButton.addEventListener("click", () => {
    additem(ingredientText.value, "ingredient", ingredientList);
    ingredientText.value = "";
    ingredientText.focus();
});

ingredientText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        additem(ingredientText.value, "ingredient", ingredientList);
        ingredientText.value = "";
    }
});

const instructionButton = document.getElementById("add-instruction");
const instructionText = document.getElementById("instruction");
const instructionList = document.getElementById("instruction-container");

instructionButton.addEventListener("click", () => {
    additem(instructionText.value, "instruction", instructionList);
    instructionText.value = "";
    instructionText.focus();
});

instructionText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        additem(instructionText.value, "instruction", instructionList);
        instructionText.value = "";
    }
});

[...document.getElementsByClassName("container")].forEach((item) => {
    item.addEventListener("focus", () => {
        const itemName = item.id.split("-")[0];
        const countItems = item.querySelectorAll("div").length;
        displayMessage(`${countItems} ${itemName}s`, false);
    })
});

/* Save and reset handlers ***********************/
const resetButton = document.getElementById("reset-button");
const saveButton = document.getElementById("save-button");

resetButton.addEventListener("click", () => {
    // clear title
    titleText.value = "";
    titleText.focus();

    // clear ingredients
    ingredientText.value = "";
    const ingredients = [...document.getElementsByClassName("ingredient")];
    ingredients.forEach((item) => item.remove())

    // clear instructions
    instructionText.value = "";
    const instructions = [...document.getElementsByClassName("instruction")];
    instructions.forEach((item) => item.remove())

    displayMessage("Form cleared", false);
});

saveButton.addEventListener("click", () => {
    // initialize recipe object
    const recipe = {title: titleText.value,
                    ingredients: [],
                    instructions: []};
    
    // check title
    if (recipe.title === "") {
        displayMessage("Must have a title!", true);
        titleText.focus();
        return;
    }

    // add ingredients
    const ingredients = [...document.getElementsByClassName("ingredient")];
    if (ingredients.length === 0) {
        displayMessage("Must include at least one ingredient!", true);
        ingredientText.focus();
        return;
    }
    ingredients.forEach((item) => recipe.ingredients.push(item.innerHTML));

    // add instructions
    const instructions = [...document.getElementsByClassName("instruction")];
    if (instructions.length === 0) {
        displayMessage("Must include at least one instruction!", true);
        instructionText.focus();
        return;
    }
    instructions.forEach((item) => recipe.instructions.push(item.innerHTML));

    // write card
    writeRecipeToFile(recipe);
    displayMessage("Recipe card downloaded", false);
});

/* error and screen reader live broadcasts ********/
function displayMessage(message, show) {
    const errorBox = document.getElementById("error-message");
    errorBox.innerHTML = message;
    if (show) {
        errorBox.style.setProperty("top", "300px");
    }
    setTimeout(() => {
        errorBox.style.setProperty("top", "-100px");
        errorBox.innerHTML = "";
    }, 5000);
}

/*  Manage theme toggle **************************/
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
