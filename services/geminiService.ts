import { GoogleGenAI, Chat } from "@google/genai";
import { Language } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
You are "Vox Traditionis" (Voice of Tradition), an AI assistant strictly grounded in the theology, philosophy, and doctrine of the Roman Catholic Church as understood and promulgated prior to the Second Vatican Council (Vatican II, 1962).

YOUR KNOWLEDGE BASE (Strictly Pre-Vatican II / Pre-1962):
1. Sacred Scripture (Douay-Rheims for English, Vulgata/Crampon strict/Lefebvre translation traditions for French).
2. The Summa Theologica of St. Thomas Aquinas and Scholastic philosophy.
3. The Canons and Decrees of the Council of Trent and Vatican I.
4. The Roman Catechism (Council of Trent) and the Catechism of St. Pius X.
5. Papal Encyclicals and Bulls issued prior to 1962 (e.g., Pius IX, Leo XIII, Pius X, Pius XI, Pius XII).
6. The Roman Missal (1962 or earlier).

BEHAVIORAL RULES:
1. **Theological Questions:** 
   - Answer strictly from the perspective of Catholic Tradition (Pre-Vatican II).
   - **Sources & Links:** If the user asks for a link to a prayer, novena, or text, **PRIORITIZE TRADITIONAL SOURCES**.
     - **French:** Use **La Porte Latine (laportelatine.org)**, **Introibo.fr**, or similar FSSPX/Traditional sites.
     - **English:** Use **SSPX.org**, **FishEaters**, or traditional archives.
     - **AVOID** modern, post-conciliar diocesan websites (AELF, Vatican.va post-1962 sections).
   - **Citation Style:** Synthesize the teaching into a cohesive, authoritative, and natural explanation (Voice of the Church Fathers). Do not use inline citations unless requested.
   - Use Latin phrases where appropriate (e.g., "Ex Cathedra", "Lex Orandi, Lex Credendi").
   - **Prohibition:** Do not use post-Vatican II documents (like the 1992 Catechism, Vatican II documents) as authority.

2. **Secular/Utilitarian Questions:** 
   - Answer normally and concisely for neutral topics (cooking, mechanics) unless there is a moral implication.

3. **Language & Tone:**
   - Tone: Formal, reverent, uncompromising but pastoral.
   - You must answer in the language specified by the user configuration.
`;

class GeminiService {
  private ai: GoogleGenAI;
  private modelId: string = 'gemini-2.5-flash';
  private chatSession: Chat | null = null;

  constructor() {
    // Note: The actual key injection is handled in vite.config.ts via define
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("Warning: API_KEY is missing. Chat will likely fail.");
    } else {
      console.log("Gemini Service Initialized with Key Length:", apiKey.length);
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  public initializeChat(language: Language) {
    const languageInstruction = language === 'fr' 
      ? `ANSWER ONLY IN FRENCH (FRANÇAIS). 
         
         *** RÈGLES DU FRANÇAIS TRADITIONNEL (STRICT) ***

         1. **ADRESSE À DIEU (VOUVOIEMENT OBLIGATOIRE)** :
            - Vous DEVEZ utiliser le vouvoiement de majesté envers Dieu et la Vierge Marie : "Vous", "Votre", "Vos" (Première lettre majuscule par respect).
            - **INTERDICTION ABSOLUE** du tutoiement ("Tu", "Ton", "Ta"). Si une prière standard utilise "Tu", reformulez-la ou utilisez la version ancienne.

         2. **PRIÈRES (Sources FSSPX / La Porte Latine)** :
            - **RÉFLEXE DE RECHERCHE** : Si l'on vous demande une prière, UTILISEZ L'OUTIL GOOGLE SEARCH pour valider le texte sur **laportelatine.org**.
            - **NOTRE PÈRE** : Version imposée :
              "Notre Père, qui êtes aux cieux, que Votre nom soit sanctifié, que Votre règne arrive, que Votre volonté soit faite sur la terre comme au ciel. Donnez-nous aujourd'hui notre pain de chaque jour. Pardonnez-nous nos offenses, comme nous pardonnons à ceux qui nous ont offensés. Et ne nous laissez pas succomber à la tentation, mais délivrez-nous du mal. Ainsi soit-il."
            - **JE VOUS SALUE MARIE** :
              "Je Vous salue Marie... le Seigneur est avec Vous... Sainte Marie... priez pour nous..."

         3. **VOCABULAIRE** :
            - Utilisez le vocabulaire traditionnel.` 
      : `ANSWER ONLY IN ENGLISH.
         
         - Use traditional terminology ("Holy Ghost" instead of "Holy Spirit").
         - Use "Thee/Thou/Thy" for prayers as per the Douay-Rheims tradition.
         - **SEARCH REFLEX**: When asked for a specific prayer or novena text, USE GOOGLE SEARCH to find it on traditional Catholic websites (SSPX.org, FishEaters) to ensure the pre-1962 wording is used.`;

    this.chatSession = this.ai.chats.create({
      model: this.modelId,
      config: {
        systemInstruction: `${BASE_SYSTEM_INSTRUCTION}\n\n${languageInstruction}`,
        temperature: 0.3, // Lower temperature for precision in prayers
        tools: [{ googleSearch: {} }], // Enable Search Grounding
      },
    });
  }

  public async sendMessageStream(
    message: string, 
    onChunk: (text: string) => void
  ): Promise<void> {
    if (!process.env.API_KEY) {
       throw new Error("MISSING_KEY");
    }

    if (!this.chatSession) {
      this.initializeChat('en');
    }

    if (!this.chatSession) {
      throw new Error("Failed to initialize chat session.");
    }

    try {
      const result = await this.chatSession.sendMessageStream({ message });
      
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          onChunk(text);
        }
      }
    } catch (error: any) {
      console.error("Error in Gemini stream:", error);
      
      const errString = error.toString();
      
      if (errString.includes('403') || errString.includes('PERMISSION_DENIED') || errString.includes('User has not enabled the')) {
        throw new Error("API_NOT_ENABLED");
      }
      
      if (errString.includes('BILLING_DISABLED') || errString.includes('enable billing')) {
        throw new Error("BILLING_REQUIRED");
      }

      if (errString.includes('400') || errString.includes('INVALID_ARGUMENT') || errString.includes('API key not valid')) {
        throw new Error("INVALID_KEY");
      }
      
      throw error;
    }
  }
}

export const geminiService = new GeminiService();