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

const loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", (e) => {
    if (e.target.innerText === "Register") {
        // Add user

    }
    else if (e.target.innerText === "Save") {
        // Reset password
    }
    else {
        // Login user

    }
});

const forgotButton = document.getElementById("forgot-button");
forgotButton.addEventListener("click", () => {
    // handle password reset
});
