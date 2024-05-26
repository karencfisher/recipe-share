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

        if (passwordText !== passwordConfirmText) {
            displayError("error", "Passwords do not match");
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
        displayError("info", "Sign up successfull. You may now login.")
    }
    else if (result.redirected) {
        window.location.href = result.url;
    }
});

const forgotButton = document.getElementById("forgot-button");
forgotButton.addEventListener("click", async () => {
    const username = document.getElementById("username-text").value;
    query = {"username": username};
    result = await callRoute("/request", query);
    if (result.status === 500) {
        displayError("error", "Error processing request.")
    }
    else {
        displayError("success", "Check email for password reset.")
    }
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

