// api/contact-search.ts
// Fonction Vercel standalone (aucune dépendance à Next.js).
// A déployer dans un projet Vercel séparé, dédié uniquement à ce webhook.

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(200).json({ status: true, data: { message: "OK - endpoint actif" } });
  }

  try {
    const from: string | undefined = req.body?.from;

    if (!from) {
      return res.status(400).json({ status: false });
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
