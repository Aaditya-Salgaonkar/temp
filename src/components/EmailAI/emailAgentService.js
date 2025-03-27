import { GoogleGenerativeAI } from "@google/generative-ai";

class EmailAgentService {
  constructor(apikey) {
    this.genAI = new GoogleGenerativeAI(apikey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  username = "Adarsh Naik";

  async generateResponse(prompt) {
    try {
      const systemPrompt = `
        You are an AI email assistant for ${this.username}. Extract key details like:
        - Recipient name
        - Email subject
        - Purpose (e.g., request, apology, follow-up)
        - Action items (if any)
        - Deadline (if mentioned)

        Then, generate a well-structured email response in a professional tone. 
        Format the response as:
        Subject: [Subject Line]
        Email body: [Email Body]
        only mention these things in your response and strictly adhere to the format
      `;
      const result = await this.model.generateContent(
        `${systemPrompt}\n\nUserInput :${prompt}`
      );
      const response = await result.response;
      return response
        .text()
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*\*/g, "");
    } catch (error) {
      console.error("Error generating response:", error);
      throw new Error("Failed to generate email response.");
    }
  }
}

export default EmailAgentService;
