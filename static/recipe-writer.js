/* initially focus on title field ****************/
const titleText = document.getElementById("title");
titleText.focus();

/* Add/remove items ******************************/
function additem(string, itemClass, parent) {
    if (string === "") {
        displayMessage(`Text field for ${itemClass} must not be empty!`, true);
        parent.previousElementSibling.firstElementChild.focus();
        return;
    }
    // create new element
    const item = document.createElement("div");
    item.innerHTML = `<input type="text" value="${string}" />`;

    // set attributes
    item.classList.add(itemClass);
    item.setAttribute("tabindex", "0");

    // add event listeners to delete (shift + click or space)
    item.addEventListener("click", (e) => {
        if (e.shiftKey) {
            item.remove();
            const countItems = parent.querySelectorAll("div").length;
            displayMessage(`${htmlString} removed ${countItems} ${itemClass}s remaining`, false);
            parent.previousElementSibling.firstElementChild.focus();
        }
    });

    item.addEventListener("keypress", (e) => {
        // shift+space bar to remove
        if (e.shiftKey && e.code === "Space") {
            item.remove();
            const countItems = parent.querySelectorAll("div").length;
            displayMessage(`${string} removed ${countItems} ${itemClass}s remaining`, false);
            parent.previousElementSibling.firstElementChild.focus();
        }
        else if (e.code === "Enter") {
            parent.previousElementSibling.firstElementChild.focus();
        }
    });

    // Add to parent
    parent.appendChild(item);
    const countItems = parent.querySelectorAll("div").length;
    displayMessage(`${string} added to total ${countItems} ${itemClass}s`, false);             
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

const descriptionText = document.getElementById("description-text")
const tagButton = document.getElementById("add-tag");
const tagText = document.getElementById("tag");
const tagList = document.getElementById("tags-container");

tagButton.addEventListener("click", () => {
    additem(tagText.value, "tag", tagList);
    tagText.value = "";
    tagText.focus();
});

tagText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        additem(tagText.value, "tag", tagList);
        tagText.value = "";
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
const previewButton = document.getElementById("preview-button");
const generateButton = document.getElementById("generate-button");

function buildRecipe(complete) {
    // initialize recipe object
    const recipe = {
        Title: titleText.value,
        Ingredients: [],
        Instructions: [],
        Tags: [],
        Image_Name: "",
        Views: 0,
        Description: "",
    };

    // check title
    if (recipe.Title === "") {
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
    ingredients.forEach((item) => {
        const textBox = item.querySelector("input");
        recipe.Ingredients.push(textBox.value);
    });

    // add instructions
    const instructions = [...document.getElementsByClassName("instruction")];
    if (instructions.length === 0) {
        displayMessage("Must include at least one instruction!", true);
        instructionText.focus();
        return;
    }
    instructions.forEach((item) => {
        const textBox = item.querySelector("input");
        recipe.Instructions.push(textBox.value);
    });

    if (complete) {
        // add instructions
        const tags = [...document.getElementsByClassName("tag")];
        if (tags.length === 0) {
            displayMessage("Must include at least one tag!", true);
            tagText.focus();
            return;
        }
        tags.forEach((item) => {
            const textBox = item.querySelector("input");
            recipe.Tags.push(textBox.value);
        });

        // add description 
        if (descriptionText.value === "") {
            displayMessage("Must include a description. \"I have writer\'s block\" button will allow AI to generate.", true );
            descriptionText.focus();
            return;
        }
        recipe.Description = descriptionText.value;
    }
    return recipe;
}

resetButton.addEventListener("click", () => {
    // clear title
    titleText.value = "";
    titleText.focus();

    // clear ingredients
    ingredientText.value = "";
    const ingredients = [...document.getElementsByClassName("ingredient")];
    ingredients.forEach((item) => item.remove());

    // clear instructions
    instructionText.value = "";
    const instructions = [...document.getElementsByClassName("instruction")];
    instructions.forEach((item) => item.remove());

    // clear tags
    tagText.value = "";
    const tags = [...document.getElementsByClassName("tag")];
    tags.forEach((item) => item.remove());

    // clear description
    descriptionText.value = "";
    displayMessage("Form cleared", false);
});

saveButton.addEventListener("click", () => {
    recipe = buildRecipe(true);
    // submit recipe - TODO
    
});

previewButton.addEventListener("click", () => {
    recipe = buildRecipe(true);
    // preview recipe - TODO
});

generateButton.addEventListener("click", () => {
    recipe = buildRecipe(false);
    if (recipe != undefined) {
        // description generation - TODO
        displayMessage("ChatGPT has written a description for you! You can edit it as you see fit.", true);
    }
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
