const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/";

// Garante que o script só rode no site correto
console.log(window.location.hostname);
if (window.location.hostname === "gamersclub.com.br") {

    // Cache de IPs já enviados para evitar duplicação
    const sentLinks = new Set(JSON.parse(localStorage.getItem("sentSteamLinks") || "[]"));

    function saveSentLinks() {
        localStorage.setItem("sentSteamLinks", JSON.stringify(Array.from(sentLinks)));
    }

    function sendToDiscord(link) {
        const match = link.match(/steam:\/\/connect\/([\d.]+:\d+)\/(\w+)/); // Captura apenas links com senha
        if (match) {
            const ip = match[1]; // IP:PORTA
            const password = match[2]; // Senha

            if (sentLinks.has(ip)) {
                console.log(`🔄 IP já enviado, ignorando: ${ip}`);
                return;
            }

            console.log("🎯 Steam IP válido encontrado:", ip, "Senha:", password);
            sentLinks.add(ip);
            saveSentLinks();

            fetch(DISCORD_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: `🎮 **Steam Link Encontrado:** ${link}` })
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

    // 🚀 Observa mudanças no DOM para capturar links dinâmicos
    const observer = new MutationObserver(() => findSteamLinks());
    observer.observe(document.body, { childList: true, subtree: true });

    // Executa busca inicial ao carregar a página
    window.addEventListener("load", () => {
        setTimeout(findSteamLinks, 3000); // Aguarda carregamento da página
    });

} else {
    console.log("❌ Script não está rodando no site correto.");
}