const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/REDACTED";

console.log("🔍 Site detectado:", window.location.hostname);
console.log("🚀 Enviando para WebHook:", DISCORD_WEBHOOK_URL);

// Cache of already sent IP:PORT to avoid duplication
const sentLinks = new Set(JSON.parse(localStorage.getItem("sentSteamLinks") || "[]"));

function saveSentLinks() {
    localStorage.setItem("sentSteamLinks", JSON.stringify(Array.from(sentLinks)));
}

// Define regex once to reuse it
const steamRegex = /steam:\/\/connect\/([\d.]+):(\d+)\/(\w+)/gi;

function extractSteamLinks(text) {
    return [...text.matchAll(steamRegex)];
}

function sendToDiscord(link) {
    const match = extractSteamLinks(link)[0]; // Get the first match
    if (match) {
        const ip = match[1]; // IP
        const port = match[2]; // Port
        const password = match[3]; // Password
        const ipPort = `${ip}:${port}`; // Unique key for cache

        if (sentLinks.has(ipPort)) {
            console.log(`⚠️ IP:PORT already sent, ignoring: ${ipPort}`);
            return;
        }

        console.log("🎯 Valid Steam IP found:", ip, "Port:", port, "Password:", password);
        sentLinks.add(ipPort);
        saveSentLinks();

        // Calculate timestamp for 3 minutes in the future
        const timestamp = Math.floor(Date.now() / 1000) + 180;

        fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: `🎮 **Steam Link Found:** ${link}\n🔗 **IP:Port:** \`${ip}:${port}\`\n⏳ **Expires:** <t:${timestamp}:R>`
            })
        })
        .then(() => console.log("✅ Link successfully sent!"))
        .catch(error => console.error("❌ Error sending:", error));
    }
}

function findSteamLinks() {
    const matches = extractSteamLinks(document.body.innerHTML);
    matches.forEach(match => sendToDiscord(match[0])); // Send full link
}

// 🔄 Observes DOM changes to capture dynamic links
const observer = new MutationObserver(() => findSteamLinks());
observer.observe(document.body, { childList: true, subtree: true });

window.addEventListener("load", () => {
    setTimeout(findSteamLinks, 3000); // Waits for the page to load
});