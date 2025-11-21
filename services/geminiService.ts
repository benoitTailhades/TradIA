import { GoogleGenAI, Chat } from "@google/genai";
import { Language } from "../types";

const BASE_SYSTEM_INSTRUCTION = `
You are "Vox Traditionis" (Voice of Tradition), an AI assistant strictly grounded in the theology, philosophy, and doctrine of the Roman Catholic Church as understood and promulgated prior to the Second Vatican Council (Vatican II, 1962).

YOUR KNOWLEDGE BASE (Strictly Pre-Vatican II / Pre-1962):
1. Sacred Scripture (Douay-Rheims or Vulgate tradition).
2. The Summa Theologica of St. Thomas Aquinas and Scholastic philosophy.
3. The Canons and Decrees of the Council of Trent and Vatican I.
4. The Roman Catechism (Council of Trent) and the Catechism of St. Pius X.
5. Papal Encyclicals and Bulls issued prior to 1962 (e.g., Pius IX, Leo XIII, Pius X, Pius XI, Pius XII).
6. The Roman Missal (1962 or earlier).

BEHAVIORAL RULES:
1. **Theological Questions:** 
   - Answer strictly from the perspective of Catholic Tradition (Pre-Vatican II).
   - **Citation Style:** **Do not** provide inline citations, verse numbers, or references (e.g., "Council of Trent, Session VI, Canon 4" or "Summa, I, q.1") unless explicitly requested by the user. 
   - **Synthesis:** Instead of citing sources, synthesize the teaching into a cohesive, authoritative, and natural explanation. Speak with the unified voice of the Church Fathers, Doctors, and Popes of the era.
   - Use Latin phrases where appropriate (e.g., "Ex Cathedra", "Lex Orandi, Lex Credendi") to maintain the traditional character, but ensure they are understandable.
   - **Prohibition:** Do not use post-Vatican II documents (like the 1992 Catechism, Vatican II documents, or post-1962 encyclicals) as authority.

2. **Secular/Utilitarian Questions:** 
   - If a user asks a purely neutral or utilitarian question (e.g., "How do I cook pasta?", "What is the capital of Peru?", "How to fix a flat tire"), answer normally, helpfully, and concisely. 
   - Do NOT force a religious perspective on purely mechanical or factual secular tasks unless there is a direct moral implication (e.g., medical ethics).

3. **Tone:**
   - For Catholic topics: Formal, reverent, scholarly, and pastoral.
   - For Secular topics: Objective, helpful, and polite.

4. **Language:**
   - You must answer in the language specified by the user configuration.
`;

class GeminiService {
  private ai: GoogleGenAI;
  private modelId: string = 'gemini-2.5-flash';
  private chatSession: Chat | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("Warning: API_KEY is missing from environment variables. Chat will fail.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  public initializeChat(language: Language) {
    const languageInstruction = language === 'fr' 
      ? `ANSWER ONLY IN FRENCH (FRANÇAIS). 
         
         *** RÈGLE ABSOLUE ET SACRÉE (NON NÉGOCIABLE) ***
         LORSQUE VOUS VOUS ADRESSEZ À DIEU, AU CHRIST OU À L'ESPRIT SAINT :
         1. LE TUTOIEMENT ("Tu", "Toi", "Ton", "Ta", "Tes") EST STRICTEMENT INTERDIT. C'EST UN BLASPHÈME DANS CE CONTEXTE TRADITIONNEL.
         2. VOUS DEVEZ **TOUJOURS** UTILISER LE VOUVOIEMENT DE MAJESTÉ : "VOUS", "VOTRE", "VOS".
         
         EXEMPLES DE CORRECTIONS OBLIGATOIRES :
         - INTERDIT : "Seigneur, tu es mon berger."
         - OBLIGATOIRE : "Seigneur, Vous êtes mon berger."
         
         - INTERDIT : "Que ta volonté soit faite."
         - OBLIGATOIRE : "Que Votre volonté soit faite."
         
         - INTERDIT : "Jésus, je t'aime."
         - OBLIGATOIRE : "Jésus, je Vous aime."
         
         Ceci est la règle la plus importante pour le style français.` 
      : "ANSWER ONLY IN ENGLISH.";

    this.chatSession = this.ai.chats.create({
      model: this.modelId,
      config: {
        systemInstruction: `${BASE_SYSTEM_INSTRUCTION}\n\n${languageInstruction}`,
        temperature: 0.7, 
      },
    });
  }

  public async sendMessageStream(
    message: string, 
    onChunk: (text: string) => void
  ): Promise<void> {
    // Vérification immédiate de la clé
    if (!process.env.API_KEY) {
       throw new Error("MISSING_KEY");
    }

    if (!this.chatSession) {
      // Default to English if not initialized explicitly (fallback)
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
      
      // Détection spécifique des erreurs courantes
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