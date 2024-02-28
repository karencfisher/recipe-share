document.getElementById("back-button").addEventListener("click", () => {
    history.back();
});

const printButton = document.getElementById("print-button");
printButton.addEventListener("click", () =>{
    const idField = document.getElementById("recipe-id");
    location.href = `/printable?id=${idField.value}`;
});