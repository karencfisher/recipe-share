const selection = [...document.getElementsByClassName("select")];
selection.forEach((item) => {
    item.addEventListener("change", (e) => {
        const emailField = document.getElementById("email-div");
        const passwordConfirm = document.getElementById("password-confirm");
        const forgotButton = document.getElementById("forgot-button");
        const loginButton = document.getElementById("login-button");

        if (e.target.id === "register-select") {
            emailField.style.setProperty("display", "block");
            passwordConfirm.style.setProperty("display", "flex");
            forgotButton.style.setProperty("display", "none")
            loginButton.innerText = "Register";
        }
        else {
            emailField.style.setProperty("display", "none");
            passwordConfirm.style.setProperty("display", "none");
            forgotButton.style.setProperty("display", "block");
            loginButton.innerText = "Login";
        }
    });
});

const eyes = [...document.getElementsByClassName("eyes")];
eyes.forEach((item) => {
    item.addEventListener("click", (e) => {
        const passwordText = document.getElementById("password-text");
        let passwordConfirmText = document.getElementById("password-confirm-text");
        if (e.target.id === "eye") {
            if (e.target.innerText === "visibility") {
                e.target.innerText = "visibility_off";
                passwordText.setAttribute("type", "text");
            }
            else {
                e.target.innerText = "visibility";
                passwordText.setAttribute("type", "password");
            }
        }
        else {
            if (e.target.innerText === "visibility") {
                e.target.innerText = "visibility_off";
                passwordConfirmText.setAttribute("type", "text");
            }
            else {
                e.target.innerText = "visibility";
                passwordConfirmText.setAttribute("type", "password");
            }
        }
    });
});

async function callRoute(route, query) {
    try {
        const result = await fetch(
            route,
            {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(query)
            }
        );
        return result;
    }
    catch(error) {
        console.log(error);
    }
}

const loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", async (e) => {
    let result = null;
    if (e.target.innerText === "Register") {
        const usernameText = document.getElementById("username-text").value;
        const emailText = document.getElementById("email-text").value;
        const passwordText = document.getElementById("password-text").value;
        const passwordConfirmText = document.getElementById("password-confirm-text").value;

        const re = /\S+@\S+\.\S+/;
        if (!re.test(emailText)) {
            displayError("error", "Invalid email address");
            document.getElementById("email-text").focus();
            return;
        }

        if (passwordText !== passwordConfirmText) {
            displayError("error", "Passwords do not match");
            document.getElementById("password-text").focus();
            return;
        }

        if (passwordText === "") {
            displayError("error", "Empty passwords not allowed!");
            return;
        }

        query = {
            "username": usernameText,
            "email": emailText,
            "password": passwordText
        }
        result = await callRoute("/register", query);

    }
    else if (e.target.innerText === "Save") {
        const usernameText = document.getElementById("username-text").value;
        const passwordText = document.getElementById("password-text").value;
        const passwordConfirmText = document.getElementById("password-confirm-text").value;

        if (usernameText === "") {
            displayError("error", "Include your user name in this request!");
            return;
        }
        
        if (passwordText !== passwordConfirmText) {
            displayError("error", "Passwords do not match");
            return;
        }

        if (passwordText === "") {
            displayError("error", "Empty passwords not allowed!");
            return;
        }

        query = {
            "username": usernameText,
            "password": passwordText
        };
        result = await callRoute("/reset", query)
    }
    else {
        const usernameText = document.getElementById("username-text").value;
        const passwordText = document.getElementById("password-text").value;
        query = {
            "username": usernameText,
            "password": passwordText
        }
        result = await callRoute("/login", query);
    }

    if (result.status === 401) {
        displayError("error", "Incorrect username and/or password")
    }
    else if (result.status === 400) {
        displayError("error", "Username is already in use")
    }
    else if (result.status === 500) {
        displayError("error", "Error occured servicing request")
    }
    else if (e.target.innerText === "Register" && result.status === 200) {
        displayError("info", "Email has been sent to validate and complete your registration.")
    }
    else if (e.target.innerText === "Save" && result.status === 200) {
        displayError("info", "Password reset successfully. You can return to login page and login.");
    }
    else if (result.redirected) {
        window.location.href = result.url;
    }
});

document.getElementById("password-text").addEventListener("keypress", async (e) => {
    let result = null;
    if (e.code === 'Enter') {
        const usernameText = document.getElementById("username-text").value;
        const passwordText = document.getElementById("password-text").value;
        query = {
            "username": usernameText,
            "password": passwordText
        }
        result = await callRoute("/login", query);

        if (result.status === 401) {
            displayError("error", "Incorrect username and/or password")
        }
        else if (result.status === 400) {
            displayError("error", "Username is already in use")
        }
        else if (result.status === 500) {
            displayError("error", "Error occured servicing request")
        }
        else if (e.target.innerText === "Register" && result.status === 200) {
            displayError("info", "Sign up successfull. You may now login.")
        }
        else if (result.redirected) {
            window.location.href = result.url;
        }
    }
});

const forgotButton = document.getElementById("forgot-button");
if (forgotButton) {
    forgotButton.addEventListener("click", async () => {
        const username = document.getElementById("username-text").value;
        if (username === "") {
            displayError("error", "Include your user name in this request!");
            return;
        }
        query = {"username": username};
        result = await callRoute("/request", query);
        if (result.status === 500) {
            displayError("error", "Error processing request.")
        }
        else {
            displayError("success", "Email has been sent with instructions to reset your password.")
        }
    });
}

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

addEventListener("load", () => { 
    const pick = Math.floor(Math.random() * 10);
    const img = `url(static/background-images/food${pick}.jpg)`
    document.body.style.setProperty("background-image", img);
});

