(() => {
    // Theme toggle elements
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const themeText = document.getElementById("themeText");

    // Theme management
    function initTheme() {
        // Load saved theme from localStorage
        try {
            const savedTheme = localStorage.getItem("neopong:theme");
            if (savedTheme === "light") {
                document.documentElement.setAttribute("data-theme", "light");
                themeIcon.innerHTML =
                    '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
                themeText.textContent = "Light";
            }
        } catch (_) {}
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", newTheme);

        if (newTheme === "light") {
            themeIcon.innerHTML =
                '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
            themeText.textContent = "Light";
        } else {
            themeIcon.innerHTML =
                '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
            themeText.textContent = "Dark";
        }

        // Save theme preference
        try {
            localStorage.setItem("neopong:theme", newTheme);
        } catch (_) {}
    }

    // Add theme toggle event listener
    themeToggle.addEventListener("click", toggleTheme);

    // Initialize
    initTheme();
})();
