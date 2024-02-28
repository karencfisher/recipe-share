document.getElementById("back-button").addEventListener("click", () => {
    history.back();
});

const printButton = document.getElementById("print-button");
printButton.addEventListener("click", () => {
    const noPrint = [...document.getElementsByClassName("no-print")];
    noPrint.forEach((item) => {
        item.style.setProperty("display", "none");
    });
    window.print();
    noPrint.forEach((item) => {
        item.style.setProperty("display", "flex");
    });
});

const downloadButton = document.getElementById("download-button");
downloadButton.addEventListener("click", () => {
    const main = document.getElementById("main");
    const titleField = document.getElementById("card-title");
    const title = titleField.querySelector("h1").innerHTML;
    const opt = {
        filename: `${title}.pdf`
    }
    html2pdf().set(opt).from(main).save();
});