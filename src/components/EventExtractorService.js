// eventExtractorService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

class EventExtractorService {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    async extractEventInfo(input) {
        const today = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });

        const prompt = `Today is ${today}. 
        Does the following text describe a calendar event? 
        Answer with 'Yes' or 'No' and provide a confidence score between 0 and 1.

        Text: ${input}

        Return your answer in the format: 'Yes, confidence: 0.85' or 'No, confidence: 0.65'.`;

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text().toLowerCase().trim();
            
            const isEvent = responseText.includes('yes');
            const confidenceMatch = responseText.match(/confidence:\s*([\d.]+)/);
            const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;

            return {
                description: input,
                is_calendar_event: isEvent,
                confidence_score: confidence
            };
        } catch (error) {
            console.error('Error in event extraction:', error);
            throw error;
        }
    }

    async parseEventDetails(description) {
        const today = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });

        const prompt = `Today is ${today}. 
        Carefully extract the following event details from the text:
        1. Event Name
        2. Exact Date (in ISO 8601 format)
        3. Exact Time 
        4. Duration in minutes
        5. List of Participants

        Use natural language processing to parse the date and time accurately.
        If any detail is missing, provide a reasonable default.

        Text: ${description}

        Format your response EXACTLY like this:
        Name: [Event Name]
        Date: [YYYY-MM-DD]
        Time: [HH:MM]
        Duration: [number of minutes]
        Participants: [comma-separated list]`;

        try {
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text().trim();
            
            // Parse the response using a more robust method
            const parseDetail = (label) => {
                const regex = new RegExp(`${label}: (.+)`, 'i');
                const match = responseText.match(regex);
                return match ? match[1].trim() : null;
            };

            // Extract details
            const name = parseDetail('Name') || 'Unknown Event';
            const dateStr = parseDetail('Date');
            const timeStr = parseDetail('Time');
            const durationStr = parseDetail('Duration');
            const participantsStr = parseDetail('Participants');

            // Construct a proper date
            let eventDate = new Date();
            if (dateStr) {
                try {
                    eventDate = new Date(dateStr);
                } catch (error) {
                    console.warn('Error parsing date:', error);
                }
            }

            // If time is provided, set the time
            if (timeStr) {
                const [hours, minutes] = timeStr.split(':').map(Number);
                eventDate.setHours(hours, minutes, 0, 0);
            }

            return {
                name: name,
                date: eventDate.toISOString(),
                duration_minutes: parseInt(durationStr) || 60,
                participants: participantsStr 
                    ? participantsStr.split(',').map(p => p.trim()) 
                    : ['Alice', 'Bob']
            };
        } catch (error) {
            console.error('Error in event details parsing:', error);
            throw error;
        }
    }

    async generateConfirmation(eventDetails) {
        const prompt = `Generate a natural confirmation message for the following event details. 
        Sign off with your name as 'Susie'.

        Event Name: ${eventDetails.name}
        Date: ${new Date(eventDetails.date).toLocaleString()}
        Duration: ${eventDetails.duration_minutes} minutes
        Participants: ${eventDetails.participants.join(', ')}`;

        try {
            const result = await this.model.generateContent(prompt);
            console.log(eventDetails);
            return {
                confirmation_message: result.response.text().trim(),
                calendar_link: 'https://calendar.example.com/event123'
            };
        } catch (error) {
            console.error('Error generating confirmation:', error);
            throw error;
        }
    }

    async processCalendarRequest(userInput) {
        try {
            // Extract event info
            const extraction = await this.extractEventInfo(userInput);

            // Gate check
            if (!extraction.is_calendar_event || extraction.confidence_score < 0.7) {
                throw new Error("This doesn't appear to be a calendar event request.");
            }

            // Parse event details (now with improved parsing)
            const details = await this.parseEventDetails(extraction.description);

            // Generate confirmation using the parsed details
            const confirmation = await this.generateConfirmation(details);

            return confirmation;
        } catch (error) {
            console.error("Error processing calendar request:", error);
            throw error;
        }
    }
}

export default EventExtractorService;