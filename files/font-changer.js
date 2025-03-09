const fonts = [
    "Arial", "Verdana", "Courier New", "Georgia", "Times New Roman",
    "Trebuchet MS", "Impact", "Comic Sans MS", "Lucida Console",
    "Tahoma", "Garamond", "Palatino Linotype", "Helvetica", "Calibri",
    "Futura", "Gill Sans", "Optima", "Rockwell", "Baskerville",
    "Franklin Gothic", "Century Gothic", "Candara", "Perpetua"
];

function changeFont() {
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
    document.getElementById("github-link").style.fontFamily = randomFont;
}

setInterval(changeFont, 100);