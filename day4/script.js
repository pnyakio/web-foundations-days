
/* 1. Find the HTML elements */
const textarea = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

/* 2. Names used to save data in browser storage */
const DRAFT_KEY = "day4-draft";
const THEME_KEY = "day4-theme";

/* 3. Update the character and word counters */
function updateCounts() {
    const text = textarea.value;

    // Count every character, including spaces
    const characters = text.length;

    // Trim outer spaces and count words separated by whitespace
    const trimmedText = text.trim();
    const words = trimmedText === ""
        ? 0
        : trimmedText.split(/\s+/).length;

    charCount.textContent = `${characters} / 200 characters`;
    wordCount.textContent = `${words} words`;

    // Reset old styles before applying the correct one
    charCount.classList.remove("warning", "over");

    if (characters > 200) {
        charCount.classList.add("over");
    } else if (characters > 180) {
        charCount.classList.add("warning");
    }
}

/* 4. Save the current draft */
function saveDraft() {
    localStorage.setItem(DRAFT_KEY, textarea.value);
}

/* 5. Clear the text, counters and saved draft */
function clearDraft() {
    textarea.value = "";
    localStorage.removeItem(DRAFT_KEY);
    updateCounts();
    textarea.focus();
}

/* 6. Apply a theme and update the button label */
function applyTheme(isDark) {
    document.body.classList.toggle("dark", isDark);

    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

/* 7. Update counters and save whenever the user types */
textarea.addEventListener("input", () => {
    updateCounts();
    saveDraft();
});

/* 8. Clear when the Clear button is clicked */
clearBtn.addEventListener("click", clearDraft);

/* 9. Clear when Escape is pressed inside the textarea */
textarea.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        clearDraft();
    }
});

/* 10. Switch between light and dark themes */
themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    applyTheme(!isDark);
});

/* 11. Restore the saved draft and theme on page load */
const savedDraft = localStorage.getItem(DRAFT_KEY);

if (savedDraft !== null) {
    textarea.value = savedDraft;
}

const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme === "dark");

updateCounts();
