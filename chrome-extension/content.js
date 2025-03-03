const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1338652659196100638/Rd_D5smi50yFBnFr77HdzkuPj4r2Q7M5KzeU8AWfsr0cEWrPqPVb-6RAct6O1nIh2YWF";

// Garante que o script só rode no site correto
console.log("� Site detectado:", window.location.hostname);
console.log("� Enviando para WebHook:", DISCORD_WEBHOOK_URL);

// Cache de IPs já enviados para evitar duplicação
const sentLinks = new Set(JSON.parse(localStorage.getItem("sentSteamLinks") || "[]"));

function saveSentLinks() {
    localStorage.setItem("sentSteamLinks", JSON.stringify(Array.from(sentLinks)));
}

function sendToDiscord(link) {
    const match = link.match(/steam:\/\/connect\/([\d.]+:\d+)\/(\w+)/);
    if (match) {
        const ip = match[1]; // IP:PORTA
        const password = match[2]; // Senha

        if (sentLinks.has(ip)) {
            console.log(`⚠️ IP já enviado, ignorando: ${ip}`);
            return;
        }

        console.log("� Steam IP válido encontrado:", ip, "Senha:", password);
        sentLinks.add(ip);
        saveSentLinks();

        // Calcula timestamp para 3 minutos no futuro
        const timestamp = Math.floor(Date.now() / 1000) + 120;

        fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: `� **Steam Link Encontrado:** ${link}\n⏳ **Expire :** <t:${timestamp}:R>`
            })
        })
        .then(() => console.log("✅ Link enviado com sucesso!"))
        .catch(error => console.error("❌ Erro ao enviar:", error));
    }
}

function findSteamLinks() {
    const regex = /steam:\/\/connect\/[\d.]+:\d+\/\w+/gi;
    const matches = [...document.body.innerHTML.matchAll(regex)];

    matches.forEach(match => {
        const link = match[0];
        sendToDiscord(link);
    });
}

// � Observa mudanças no DOM para capturar links dinâmicos
const observer = new MutationObserver(() => findSteamLinks());
observer.observe(document.body, { childList: true, subtree: true });

// Executa busca inicial após carregamento da página
window.addEventListener("load", () => {
    setTimeout(findSteamLinks, 3000); // Aguarda carregamento da página
});