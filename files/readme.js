//You don't have to read me. I'm here just to fetch the text from the README.md file my creator has.
async function fetchGitHubReadme() {
    try {
        const response = await fetch("https://raw.githubusercontent.com/TCMFatbird/TCMFatbird/main/README.md");
        if (response.ok) {
            const text = await response.text();
            document.getElementById("hoverText").style.fontFamily = "Inter, sans-serif";
            document.getElementById("hoverText").innerText = text.split("\n").slice(0, 5).join("\n"); // Show first 5 lines
        } else {
            document.getElementById("hoverText").innerText = "Failed to load README.";
        }
    } catch (error) {
        document.getElementById("hoverText").innerText = "Error loading README.";
    }
}

function showText() {
    const textDiv = document.getElementById("hoverText");
    textDiv.style.display = "block";
    setTimeout(() => {
        textDiv.style.opacity = "1";
        textDiv.style.transform = "translateY(0)";
    }, 10); // Slight delay to trigger animation

    if (!textDiv.dataset.loaded) {
        fetchGitHubReadme();
        textDiv.dataset.loaded = "true";
    }
}

function hideText() {
    const textDiv = document.getElementById("hoverText");
    textDiv.style.opacity = "0";
    textDiv.style.transform = "translateY(10px)";
    setTimeout(() => {
        textDiv.style.display = "none";
    }, 300);
}