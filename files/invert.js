const btn = document.getElementById("invert-btn");
let isInverted = false;
      
btn.addEventListener("click", () => {
    isInverted = !isInverted;
    document.documentElement.style.filter = isInverted ? "invert(1)" : "invert(0)";
});