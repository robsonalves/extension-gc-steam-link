const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/REDACTED";

console.log("🔍 Site detectado:", window.location.hostname);
console.log("🚀 Enviando para WebHook:", DISCORD_WEBHOOK_URL);

// Cache of already sent IP:PORT to avoid duplication
 const sentLinks = new Set(JSON.parse(localStorage.getItem("sentSteamLinks") || "[]"));

 function saveSentLinks() {
     localStorage.setItem("sentSteamLinks", JSON.stringify(Array.from(sentLinks)));
 }

 function sendToDiscord(link) {
     const match = link.match(/steam:\/\/connect\/([\d.]+):(\d+)\/(\w+)/);
     if (match) {
         const ip = match[1]; // IP
         const port = match[2]; // Porta
         const password = match[3]; // Senha
         const ipPort = `${ip}:${port}`; // Chave única para cache

         if (sentLinks.has(ipPort)) {
             console.log(`⚠️ IP:PORTA já enviado, ignorando: ${ipPort}`);
             return;
         }

         console.log("🎯 Steam IP válido encontrado:", ip, "Porta:", port, "Senha:", password);
         sentLinks.add(ipPort);
         saveSentLinks();

         // Calcula timestamp para 3 minutos no futuro
         const timestamp = Math.floor(Date.now() / 1000) + 180;

         fetch(DISCORD_WEBHOOK_URL, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
                 content: `🎮 **Steam Link Encontrado:** ${link}\n🔗 **IP:Porta:** \`${ip}:${port}\`\n⏳ **Expire:** <t:${timestamp}:R>`
             })
         })
         .then(() => console.log("✅ Link enviado com sucesso!"))
         .catch(error => console.error("❌ Erro ao enviar:", error));
     }
 }

 function findSteamLinks() {
     const regex = /steam:\/\/connect\/([\d.]+):(\d+)\/(\w+)/gi;
     const matches = [...document.body.innerHTML.matchAll(regex)];

     matches.forEach(match => {
         const link = match[0];
         sendToDiscord(link);
     });
 }

 // 🔄 Observes DOM changes to capture dynamic links
 const observer = new MutationObserver(() => findSteamLinks());
 observer.observe(document.body, { childList: true, subtree: true });

 window.addEventListener("load", () => {
    setTimeout(findSteamLinks, 3000); // Waits for the page to load
 });