document.getElementById("back-button").addEventListener("click", () => {
    history.back();
});

const printButton = document.getElementById("print-button");
printButton.addEventListener("click", () =>{
    location.href = "/printable";
});


