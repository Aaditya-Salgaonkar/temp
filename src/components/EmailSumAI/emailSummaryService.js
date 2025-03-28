import { GoogleGenerativeAI } from "@google/generative-ai";

class EmailSummaryService {
  constructor(apikey) {
    this.genAI = new GoogleGenerativeAI(apikey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  username = "Aaditya Salgaonkar";

  async summarizeEmails(emails) {
    try {
      const summaries = [];
      for (const email of emails) {
        const emailContent = this.extractEmailContent(email);
        const systemPrompt = `
          You are an AI assistant for ${this.username}. Summarize the following email content in a concise and professional manner:
          Email Content: ${emailContent}
        `;
        const result = await this.model.generateContent(systemPrompt);
        const response = await result.response;
        summaries.push(response.text());
      }
      return summaries;
    } catch (error) {
      console.error("Error summarizing emails:", error);
      throw new Error("Failed to summarize emails.");
    }
  }

  extractEmailContent(email) {
    const headers = email.payload.headers;
    const subject = headers.find((header) => header.name === "Subject")?.value || "No Subject";
    const body = email.payload.body?.data
      ? atob(email.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"))
      : "No Body Content";
    return `Subject: ${subject}\nBody: ${body}`;
  }
}

export default EmailSummaryService;