import { GoogleGenerativeAI } from "@google/generative-ai";
import * as mammoth from "mammoth"; // Library to extract text from Word files

class HrRecruitmentService {
  constructor(apikey) {
    this.genAI = new GoogleGenerativeAI(apikey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Extracts email addresses from the resume content using a regular expression.
   * @param {string} content - The text content of the resume.
   * @returns {string|null} - The first email address found or null if none.
   */
  extractEmailFromResume(content) {
    console.log("Original resume content:", content); // Debugging log
  
    // Normalize the content
    const normalizedContent = content.replace(/\s+/g, " ").trim(); // Replace line breaks and extra spaces with a single space
    console.log("Normalized resume content:", normalizedContent); // Debugging log
  
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; // Regex to match email addresses
    const emails = normalizedContent.match(emailRegex); // Find all matches
  
    console.log("Emails found:", emails); // Debugging log
  
    return emails ? emails[0] : null; // Return the first email or null if no match
  }
  

  /**
   * Extracts the text content from Word files (.docx) using the Mammoth library.
   * @param {File[]} files - Array of Word files uploaded by the user.
   * @returns {Promise<Object[]>} - Array of objects containing fileName and content.
   */
  async extractResumeContents(files) {
    try {
      const contents = [];
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer(); // Read the file as an ArrayBuffer
        const result = await mammoth.extractRawText({ arrayBuffer }); // Extract text using Mammoth
        contents.push({ fileName: file.name, content: result.value }); // Store file name and extracted content
      }
      return contents;
    } catch (error) {
      console.error("Error extracting resume contents:", error);
      throw new Error("Failed to extract resume contents.");
    }
  }

  /**
   * Evaluates resumes based on the job description and keywords.
   * Extracts email addresses and returns evaluation results.
   * @param {Object[]} resumes - Array of objects containing fileName and content.
   * @param {string} jobDescription - The job description provided by the user.
   * @param {string} keywords - Keywords to match in the resumes.
   * @returns {Promise<Object[]>} - Array of results with fileName, status, and email.
   */
  async evaluateResumes(resumes, jobDescription, keywords) {
    try {
        
      const results = [];
      for (const resume of resumes) {
        const systemPrompt = `
          You are an AI recruitment assistant. Evaluate the following resume based on the job description and keywords provided.
          Job Description: ${jobDescription}
          Keywords: ${keywords}
          Resume Content: ${resume.content}
          If the resume matches the job description and keywords, respond with "Approved". Otherwise, respond with "Rejected".
        `;
        const result = await this.model.generateContent(systemPrompt); // Generate AI response
        const response = await result.response;
        const status = response.text().trim(); // Extract the status ("Approved" or "Rejected")

        // Extract email from the resume content
        const candidateEmail = this.extractEmailFromResume(resume.content); // Extract email address

        // Add the result to the results array
        results.push({ fileName: resume.fileName, status, email: candidateEmail });
      }
      return results;
    } catch (error) {
      console.error("Error evaluating resumes:", error);
      throw new Error("Failed to evaluate resumes.");
    }
  }
}

export default HrRecruitmentService;