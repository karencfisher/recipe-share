/* initially focus on title field ****************/
const titleText = document.getElementById("title");
titleText.focus();

// track changes
let dirty = false;
addEventListener("change", () => {
    dirty = true;
});

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
            displayMessage("info", `${string} removed ${countItems} ${itemClass}s remaining`, false);
        }
    });

    item.addEventListener("keydown", (e) => {
        // shift+space bar to remove
        if (e.key === "Delete" || (e.key === "Backspace" && e.target.value === "")) {
            e.preventDefault();
            focusNext(item, textBox);
            item.remove();
            const countItems = parent.querySelectorAll("div").length;
            displayMessage("info", `${string} removed ${countItems} ${itemClass}s remaining`, false);
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            parent.insertBefore(item, item.previousElementSibling)
            item.focus();
        }
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (item.nextElementSibling) {
                parent.insertBefore(item, item.nextElementSibling.nextElementSibling);
                item.focus();
            }
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
    displayMessage("info", `${string} added to total ${countItems} ${itemClass}s`, false);
    return item;             
}

const ingredientButton = document.getElementById("add-ingredient");
const ingredientText = document.getElementById("ingredient");
const ingredientList = document.getElementById("ingredient-container");

titleText.addEventListener("keypress", (e) => {
    if (e.code === "Enter") {
        if (e.target.value === "") {
            displayMessage("error", "Title field must not be empty!", true);
        }
        else {
            displayMessage("info", `Title ${e.target.value} added`, false)
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
        displayMessage("info", `${countItems} ${itemName}s`, false);
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
        displayMessage("info", `${countItems} ${itemName}s`, false);
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
const publishButton = document.getElementById("publish-button");
const generateButton = document.getElementById("generate-button");

function buildRecipe(complete) {
    // initialize recipe object
    const idField = document.getElementById("recipe-id");
    const recipe = {
        _id: idField.value,
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
        displayMessage("error", "Must have a title!", true);
        titleText.focus();
        return;
    }

    // add ingredients
    const ingredients = [...document.getElementsByClassName("ingredient")];
    if (ingredients.length === 0) {
        displayMessage("error", "Must include at least one ingredient!", true);
        ingredientText.focus();
        return;
    }
    ingredients.forEach((item) => {
        recipe.Ingredients.push(item.value);
    });

    // add instructions
    const instructions = [...document.getElementsByClassName("instruction")];
    if (instructions.length === 0) {
        displayMessage("error", "Must include at least one instruction!", true);
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
            if (fileInput.files === null) {
                recipe.imageFile = fileInput.value;
            }
            else if (fileInput.files.length > 0) {
                recipe.imageFile = fileInput.files[0].name;
            }
            if (image) {
                recipe.imageData = image.src;
            }
        }
        else {
            recipe.imageFile = image.src;
        }

        // add tags
        const tags = [...document.getElementsByClassName("tag")];
        if (tags.length === 0) {
            displayMessage("eror", "Must include at least one tag!", true);
            tagText.focus();
            return;
        }
        tags.forEach((item) => {
            recipe.Tags.push(item.value);
        });

        // add description 
        if (descriptionText.value === "") {
            displayMessage("error", "Must include a description. \"I have writer\'s block\" button will allow AI to generate.", true );
            descriptionText.focus();
            return;
        }
        recipe.Description = descriptionText.value;
    }
    return recipe;
}

backButton.addEventListener("click", () => {
    if (dirty) {
        showChangedDialog((confirmed) => {
            if (confirmed) {
                history.back();
            }
        });
    }
    else { 
        history.back();
    }
}); 

function showChangedDialog(callback) {
    const changedDialog = document.getElementById("changed-dialog");
    changedDialog.dataset.open = "true";

    document.getElementById("changed-cancel-button").addEventListener("click", () => {
        callback(false);
        changedDialog.dataset.open = "false";
    });
   
    document.getElementById("changed-ok-button").addEventListener("click", () => {
        callback(true);
        changedDialog.dataset.open = "false";
    });
}

previewButton.addEventListener("click", () => {
    recipe = buildRecipe(true);
    if (recipe != undefined) {
        fetch('/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        })
        .then(response => response.json())
        .then(data => {
            if (data.response == 200) {
                const newURL = `/edit?update=true&mode=${document.body.className}`;
                history.replaceState({}, "", newURL);
                location.href = `/preview?mode=${document.body.className}`;
            }
            else {
                displayMessage("info", `Error occured ${data.response}`, true);
            }
        })
        .catch(error => console.error('Error:', error));
    }
});

publishButton.addEventListener("click", () => {
    recipe = buildRecipe(true);
    if (recipe != undefined) {
        dirty = false;
        fetch('/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        })
        .then(response => response.json())
        .then(data => {
            if (data.response == 200) {
                fetch("/publish", {
                    method: 'GET'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.response == 200) {
                        displayMessage("info", "Recipe published!", true)
                    }
                })
                .catch(error => console.error('Error:', error));
            }
            else {
                displayMessage("error", `Error occured ${data.response}`, true);
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
            displayMessage("info", "ChatGPT has written a description for you!", true);
        })
        .catch(error => console.error('Error:', error));
    }
});

/* error and screen reader live broadcasts ********/

function displayMessage(type, msg, show) {
    const errorMsg = document.getElementById("error-msg");
    const errortxt = document.getElementById("error-txt");
    const msgIcon = document.getElementById("msg-icon");
    
    errortxt.innerText = msg;
    if (show) {
        if (type === "info") {
            msgIcon.innerText = "info";
        }
        else {
            msgIcon.innerText = "error_outline";
        }
        errorMsg.dataset.open = "true";
    }

    setTimeout(() => {
        errorMsg.dataset.open = "false";
    }, 2000);
}

const helpButton = document.getElementById("help-button");
helpButton.addEventListener("click", (e) => {
    const help = document.getElementById("help");
    if (e.target.innerHTML === "Show editing help") {
        help.style.setProperty("display", "block");
        e.target.innerHTML = "Hide editing help";
    }
    else {
        help.style.setProperty("display", "none");
        e.target.innerHTML = "Show editing help";
    }
});

addEventListener("load", () => { 
    const pick = Math.floor(Math.random() * 10);
    const img = `url(static/background-images/food${pick}.jpg)`
    document.body.style.setProperty("background-image", img);
});
