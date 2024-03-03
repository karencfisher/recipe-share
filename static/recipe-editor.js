/* initially focus on title field ****************/
const titleText = document.getElementById("title");
titleText.focus();

/* Add/remove items ******************************/
function focusNext(item, textBox) {
    if (item.nextElementSibling) {
        item.nextElementSibling.focus();
    }
    else if (item.previousElementSibling) {
        item.previousElementSibling.focus();
    }
    else {
        textBox.focus();
    }
}

function addItem(textBox, itemClass, parent) {
    // create new element
    const item = document.createElement("textarea");
    const string = textBox.value;
    item.innerHTML = string;

    // set attributes
    item.classList.add(itemClass);
    item.setAttribute("rows", "1");

    // add event listeners to delete (shift + click or space)
    item.addEventListener("click", (e) => {
        if (e.shiftKey) {
            focusNext(item, textBox);
            item.remove();
            const countItems = parent.querySelectorAll("div").length;
            displayMessage(`${string} removed ${countItems} ${itemClass}s remaining`, false);
        }
    });

    item.addEventListener("keydown", (e) => {
        // shift+space bar to remove
        if (e.key === "Delete") {
            e.preventDefault();
            focusNext(item, textBox);
            item.remove();
            const countItems = parent.querySelectorAll("div").length;
            displayMessage(`${string} removed ${countItems} ${itemClass}s remaining`, false);
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            parent.insertBefore(item, item.previousElementSibling)
            item.focus();
        }
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            parent.insertBefore(item, item.nextElementSibling.nextElementSibling)
            item.focus();
        }
        else if (e.key === "Insert") {
            newItem = addItem(textBox, itemClass, parent);
            parent.insertBefore(newItem, item);
            newItem.focus();
        }
        else if (e.code === "Enter") {
            e.preventDefault();
            textBox.focus();
        }
    });

    // Add to parent
    parent.appendChild(item);
    item.focus()
    const countItems = parent.querySelectorAll("div").length;
    displayMessage(`${string} added to total ${countItems} ${itemClass}s`, false);
    return item;             
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
    addItem(ingredientText, "ingredient", ingredientList);
    ingredientText.value = "";
});

ingredientText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        addItem(ingredientText, "ingredient", ingredientList);
        ingredientText.value = "";
    }
});

const instructionButton = document.getElementById("add-instruction");
const instructionText = document.getElementById("instruction");
const instructionList = document.getElementById("instruction-container");

instructionButton.addEventListener("click", () => {
    addItem(instructionText, "instruction", instructionList);
    instructionText.value = "";
});

instructionText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        addItem(instructionText, "instruction", instructionList);
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
    addItem(tagText, "tag", tagList);
    tagText.value = "";
});

tagText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        addItem(tagText, "tag", tagList);
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

/* Image *****************************************/
const fileInput = document.getElementById("image-file");
const editImage = document.getElementById("edit-image")
const imageContainer = document.getElementById("image-container");

function loadImage() {
    const fileInput = document.getElementById("image-file");
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const image = document.createElement('img');
        image.src = e.target.result;
        image.id = "image";
        image.style.setProperty("width", "100%");
        fileInput.style.setProperty("display", "none");
        imageContainer.appendChild(image);
    }
    reader.readAsDataURL(file);
}

editImage.addEventListener("click", () => {
    imageContainer.innerHTML = "";
    const newFileInput = document.createElement("input");
    newFileInput.type = "file";
    newFileInput.name = "file";
    newFileInput.id = "image-file";
    newFileInput.addEventListener("change", () => loadImage());
    imageContainer.appendChild(newFileInput);
});

if (fileInput) {
    fileInput.addEventListener("change", () => loadImage());
}

/* Save and reset handlers ***********************/
const backButton = document.getElementById("back-button");
const resetButton = document.getElementById("reset-button");
const previewButton = document.getElementById("preview-button");
const generateButton = document.getElementById("generate-button");

function buildRecipe(complete) {
    // initialize recipe object
    const idField = document.getElementById("recipe-id");
    const recipe = {
        tempId: idField.value,
        Title: titleText.value,
        Ingredients: [],
        Instructions: [],
        Tags: [],
        imageFile: null,
        imageData: null,
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
        recipe.Ingredients.push(item.value);
    });

    // add instructions
    const instructions = [...document.getElementsByClassName("instruction")];
    if (instructions.length === 0) {
        displayMessage("Must include at least one instruction!", true);
        instructionText.focus();
        return;
    }
    instructions.forEach((item) => {
        recipe.Instructions.push(item.value);
    });

    if (complete) {
        // image
        const fileInput = document.getElementById("image-file");
        const image = document.getElementById("image");
        if (fileInput) {
            if (fileInput.files.length > 0) {
                recipe.imageFile = fileInput.files[0].name;
                recipe.imageData = image.src;
            }
        }
        else {
            recipe.imageFile = image.src;
        }

        // add tags
        const tags = [...document.getElementsByClassName("tag")];
        if (tags.length === 0) {
            displayMessage("Must include at least one tag!", true);
            tagText.focus();
            return;
        }
        tags.forEach((item) => {
            recipe.Tags.push(item.value);
        });

        // add description 
        if (descriptionText.value === "") {
            displayMessage("Must include a description. \"I have writer\'s block\" button will allow AI to generate.", true );
            descriptionText.focus();
            return;
        }
        recipe.Description = descriptionText.value;
        recipe.Published = (document.getElementById("published").value.toLowerCase() === 'true');
    }
    return recipe;
}

backButton.addEventListener("click", () => {
    history.back();
});

previewButton.addEventListener("click", () => {
    recipe = buildRecipe(true);
    if (recipe != undefined) {
        fetch('/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        })
        .then(response => response.json())
        .then(data => {
            if (data.response == 200) {
                location.href = `/search?id=${data.id}&preview=true&mode=${document.body.className}`;
            }
            else {
                displayMessage(`Error occured ${data.response}`);
            }
        })
        .catch(error => console.error('Error:', error));
    }
});

generateButton.addEventListener("click", () => {
    const descriptionText = document.getElementById("description-text")
    recipe = buildRecipe(false);
    if (recipe != undefined) {
        fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        })
        .then(response => response.json())
        .then(data => {
            descriptionText.value = data.response;
            displayMessage("ChatGPT has written a description for you!", true);
        })
        .catch(error => console.error('Error:', error));
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

