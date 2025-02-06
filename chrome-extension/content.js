const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1337033829784883241/6_scnki_nhrmMsbJg0nrMiXdmk_SdP_MZcKcjugtUuECwjzIkSys22hAMG8cNtXUKAQg";

function findSteamLinks() {
    const regex = /steam:\/\/[^\s"']+/gi;
    const matches = document.body.innerHTML.match(regex);

    if (matches) {
        matches.forEach(link => {
            console.log("🎯 Steam Link encontrado:", link);

            fetch(DISCORD_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: `🎮 **Steam Link Encontrado:** ${link}` })
            })
            .then(() => console.log("✅ Link enviado com sucesso!"))
            .catch(error => console.error("❌ Erro ao enviar:", error));
        });
    }
}

// Executa a busca na página após o carregamento
window.addEventListener("load", findSteamLinks);