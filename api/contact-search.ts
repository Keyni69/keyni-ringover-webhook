// api/contact-search.ts
// Fonction Vercel standalone (aucune dépendance à Next.js).
// A déployer dans un projet Vercel séparé, dédié uniquement à ce webhook.

export default async function handler(req: any, res: any) {
  // Headers CORS : indispensables car Ringover appelle cet endpoint
  // directement depuis le navigateur (app.ringover.com), pas serveur-à-serveur.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Le navigateur envoie d'abord une requête OPTIONS ("preflight") avant la vraie requête.
  // Il faut y répondre 200 immédiatement, sans autre traitement.
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(200).json({ status: true, data: { message: "OK - endpoint actif" } });
  }

  try {
    // LOG TEMPORAIRE : pour voir le format exact envoyé par Ringover
    console.log("BODY REÇU:", JSON.stringify(req.body));

    const from: string | undefined = req.body?.from;

    if (!from) {
      return res.status(400).json({ status: false, debug_body_received: req.body });
    }

    const numeroModulr = toModulrFormat(from);
    const modulrUrl = `https://app.modulr-courtage.fr/fr/scripts/Telephony/TelephonySearch.php?num=${encodeURIComponent(
      numeroModulr
    )}`;

    return res.status(200).json({
      status: true,
      data: {
        url: modulrUrl,
      },
    });
  } catch (err) {
    console.error("Erreur webhook Ringover Contact Search:", err);
    return res.status(500).json({ status: false });
  }
}

// Convertit un numéro E.164 FR (+33612345678) en format local (0612345678)
function toModulrFormat(e164: string): string {
  const cleaned = e164.replace(/\s+/g, "");
  if (cleaned.startsWith("+33")) {
    return "0" + cleaned.slice(3);
  }
  if (cleaned.startsWith("0033")) {
    return "0" + cleaned.slice(4);
  }
  return cleaned.replace("+", "");
}
