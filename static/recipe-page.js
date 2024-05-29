document.getElementById("back-button").addEventListener("click", () => {
    history.back();
});

const printButton = document.getElementById("print-button");
printButton.addEventListener("click", () =>{
    location.href = "/printable";
});

addEventListener("load", () => { 
    const pick = Math.floor(Math.random() * 10);
    const img = `url(static/background-images/food${pick}.jpg)`
    document.body.style.setProperty("background-image", img);
});
