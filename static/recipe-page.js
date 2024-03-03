document.getElementById("back-button").addEventListener("click", () => {
    history.back();
});

const printButton = document.getElementById("print-button");
printButton.addEventListener("click", () =>{
    const idField = document.getElementById("recipe-id");
    location.href = `/printable?id=${idField.value}`;
});

const publishButton = document.getElementById("publish-button");
if (publishButton) {
    publishButton.addEventListener("click", () => {
        const id = document.getElementById("recipe-id").value;
        fetch(`/publish?id=${id}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            if (data.response == 200) {
                displayMessage("Recipe published!", true)
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

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
