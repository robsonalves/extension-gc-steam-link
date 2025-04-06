const API_URL = "https://gc-steam-converter-discord-bot-production.up.railway.app/send";

// Define regex para capturar links Steam
const steamRegex = /steam:\/\/connect\/([\d.]+):(\d+)\/(\w+)/gi;

function extractSteamLinks(text) {
    return [...text.matchAll(steamRegex)];
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log("📋 Texto copiado:", text);
    }).catch(err => {
        console.error("❌ Erro ao copiar:", err);
    });
}

function sendToAPI(link) {
    const match = extractSteamLinks(link)[0]; // Pega o primeiro match
    if (match) {
        const ip = match[1]; // IP
        const port = match[2]; // Porta
        const password = match[3]; // Senha
        const cacheKey = `${ip}:${port}/${password}`; // Chave única para cache

        let stored = JSON.parse(localStorage.getItem("sentLinks") || "{}");
        let now = Date.now();
        if (stored.timestamp && now - stored.timestamp > 1800000) { // 30 minutos
            stored = { list: [], timestamp: now };
            console.log("🧹 Cache expirada, limpando...");
        }
        let sentLinks = new Set(stored.list || []);
        window.__sentLinksCache = sentLinks;

        if (sentLinks.has(cacheKey)) {
            console.log("⚠️ Link já enviado anteriormente:", cacheKey);
            return;
        }

        console.log("🎯 IP Steam encontrado:", ip, "Porta:", port, "Senha:", password);

        // Enviar para a API
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                address: `${ip}:${port}/${password}`
            })
        })
        .then(response => {
            if (response.ok) {
                console.log("✅ Link enviado para a API com sucesso!");
                sentLinks.add(cacheKey);
                localStorage.setItem("sentLinks", JSON.stringify({ list: [...sentLinks], timestamp: Date.now() }));
            } else {
                console.error("❌ Erro ao enviar para a API:", response.statusText);
            }
        })
        .catch(error => console.error("❌ Erro ao enviar para a API:", error));
    }
}

function findSteamLinks() {
    const matches = extractSteamLinks(document.body.innerHTML);
    matches.forEach(match => sendToAPI(match[0])); // Envia o link inteiro para a API
}

// 🔄 Observa mudanças no DOM para capturar links dinâmicos
const observer = new MutationObserver(() => findSteamLinks());
observer.observe(document.body, { childList: true, subtree: true });

window.addEventListener("load", () => {
    setTimeout(findSteamLinks, 3000); // Aguarda a página carregar
});