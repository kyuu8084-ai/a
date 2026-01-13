import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
You are a smart, friendly, and encouraging study assistant named "StudyWithMe AI".
Your goal is to help students learn effectively.
You must address the user by their name if provided.
IMPORTANT RULES:
1. Do NOT provide any external URL links (http/https). If a user asks for a link, politely explain that you cannot provide links but can summarize the information.
2. Keep your answers concise, well-formatted, and easy to read.
3. Use a polite, academic yet approachable tone.
4. If the user asks about the website features, explain them based on the context of "StudyWithMe" (Career guidance, study methods, materials, etc.).
`;

export const streamMessageFromGemini = async (
  history: ChatMessage[],
  newMessage: string,
  userName: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    if (!process.env.API_KEY) {
      onChunk("Xin lỗi, tôi chưa được kết nối với API (Thiếu API Key).");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION} The user's name is "${userName}".`,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessageStream({
        message: newMessage
    });

    for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
            onChunk(text);
        }
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("Đã có lỗi xảy ra khi kết nối với trợ lý ảo. Vui lòng thử lại sau.");
  }
};