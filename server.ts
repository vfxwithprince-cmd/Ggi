import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to convert raw PCM (24kHz, 16-bit mono) to valid playable WAV
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);

  // "fmt " sub-chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  header.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Text-to-Speech endpoint for Hindi with multiple voice versions and styles
app.post("/api/tts", async (req, res) => {
  try {
    const {
      text,
      voice = "Puck",
      style = "natural",
      persona = "Priya",
      styleInstruction = "",
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Text is required for TTS synthesis." });
      return;
    }

    // Limit text length for fast response and quota safety
    const sanitizedText = text.trim().slice(0, 1500);

    const ai = getGenAI();

    // Map style to natural Hindi speech guidance
    let promptText = sanitizedText;
    if (style === "storyteller") {
      promptText = `Read warmly in Hindi as an expressive storyteller: ${sanitizedText}`;
    } else if (style === "news") {
      promptText = `Read in clear Hindi as an articulate news anchor: ${sanitizedText}`;
    } else if (style === "motivational") {
      promptText = `Read with inspiring passion and confidence in Hindi: ${sanitizedText}`;
    } else if (style === "calm") {
      promptText = `Read in a gentle, peaceful, meditative Hindi tone: ${sanitizedText}`;
    } else if (style === "rj") {
      promptText = `Say in high-energy, cheerful Hindi radio jockey style: ${sanitizedText}`;
    } else if (style === "poetic") {
      promptText = `Recite with poetic cadence and emotion in Hindi: ${sanitizedText}`;
    } else if (style === "cheerful") {
      promptText = `Say cheerfully with a pleasant smile in Hindi: ${sanitizedText}`;
    } else if (styleInstruction) {
      promptText = `${styleInstruction}: ${sanitizedText}`;
    } else {
      // Natural pure Hindi pronunciation
      promptText = sanitizedText;
    }

    const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const chosenVoice = validVoices.includes(voice) ? voice : "Puck";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Data) {
      throw new Error("TTS generation returned no audio data.");
    }

    const pcmBuffer = Buffer.from(base64Data, "base64");
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString("base64");

    res.json({
      audioUrl: `data:audio/wav;base64,${wavBase64}`,
      voice: chosenVoice,
      persona,
      style,
      sampleRate: 24000,
      format: "wav",
    });
  } catch (error: any) {
    console.error("Error in /api/tts:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate speech audio.",
      fallback: true,
    });
  }
});

// Helper to generate text with model fallback in case of high demand
async function generateTextWithFallback(prompt: string, jsonMode = true): Promise<string> {
  const ai = getGenAI();
  const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: jsonMode ? { responseMimeType: "application/json" } : undefined,
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error("All text models failed to respond.");
}

// Helper endpoint to translate English or Hinglish into natural spoken Hindi (Devanagari)
app.post("/api/translate-hindi", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Text is required for translation." });
      return;
    }

    const prompt = `Translate the following user text into natural, fluent, spoken Hindi suitable for Text-to-Speech audio reading.
Return ONLY a valid JSON object with:
- "hindiText": natural Hindi translation in Devanagari script with appropriate punctuation (पूर्णविराम ।, अल्पविराम ,) for smooth speech cadence
- "hinglishText": Romanized phonetic script for easy reading (e.g. "Namaste, aaj...")

Input text: "${text.trim().slice(0, 1000)}"`;

    const rawText = await generateTextWithFallback(prompt, true);
    const parsed = JSON.parse(rawText || "{}");
    res.json({
      hindiText: parsed.hindiText || text,
      hinglishText: parsed.hinglishText || "",
    });
  } catch (error: any) {
    console.error("Error in /api/translate-hindi:", error);
    res.status(500).json({
      error: error?.message || "Translation failed.",
    });
  }
});

// Helper endpoint to polish Hindi text with natural pauses and cadence
app.post("/api/polish-hindi", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Text is required." });
      return;
    }

    const prompt = `Improve the flow, natural punctuation (पूर्णविराम ।, अल्पविराम ,), and pronunciation clarity of this Hindi text for Text-to-Speech synthesis. Do not change the core meaning.
Return ONLY a valid JSON object with:
- "polishedText": improved Devanagari Hindi string

Input: "${text.trim().slice(0, 1000)}"`;

    const rawText = await generateTextWithFallback(prompt, true);
    const parsed = JSON.parse(rawText || "{}");
    res.json({
      polishedText: parsed.polishedText || text,
    });
  } catch (error: any) {
    console.error("Error in /api/polish-hindi:", error);
    res.status(500).json({
      error: error?.message || "Polish failed.",
    });
  }
});

// Vite & Static file setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hindi Text to Speech Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
