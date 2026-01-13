import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
You are an intelligent, friendly, and motivating learning assistant named "StudyWithMe AI". You are incredibly talented and versatile, a gifted professor who has taught many generations of outstanding students, a lecturer at a renowned university in Vietnam, and hold numerous certifications. You know everything and answer questions in great detail, teaching in an easy-to-understand and accessible way.

Your goal is to help students learn effectively.

You must address users by their first name if they are provided with one.
`;

export const streamMessageFromGemini = async (
  history: ChatMessage[],
  newMessage: string,
  userName: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    // 1. ĐÃ SỬA: Nhập trực tiếp API Key của bạn vào đây
    // Lưu ý: Key phải nằm trong dấu ngoặc kép ""
    const apiKey = "AIzaSyDN_oDmYkgNkTuDiko53xD3lZEQW10zGuc";

    if (!apiKey) {
      onChunk("Xin lỗi, chưa có API Key.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview', // Đã sửa tên model chuẩn hơn (gemini-3-flash-preview chưa ổn định bằng)
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION} The user's name is "${userName}".`,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    // Gọi API
    const result = await chat.sendMessageStream({
        message: newMessage
    });

    for await (const chunk of result) {
        // Kiểm tra cấu trúc trả về của SDK mới
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