import React, { useState, useEffect } from "react";
import EventExtractorService from "./EventExtractorService";
import { gapi } from "gapi-script";
import { CheckCircle2, Clock, Mail, Send } from "lucide-react";

// IMPORTANT: Store these in environment variables in production
const CLIENT_ID =
  "608829134548-k8skvvh5bo9cgh9savt95l28j47iqdi9.apps.googleusercontent.com";
const API_KEY = "AIzaSyDAsj4Ya-34WgI5qu9zZ-qrf0dNa-ZuueQ";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const TimelineStep = ({ icon: Icon, title, description, isActive, isCompleted }) => {
  return (
    <div className={`flex items-center mb-4 transition-all duration-500 ease-in-out ${isActive ? "opacity-100" : "opacity-50"}`}>
      <div className={`mr-4 ${isCompleted ? "text-green-500" : "text-gray-400"}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className={`font-semibold ${isActive ? "text-black" : "text-gray-600"}`}>{title}</h3>
        {isActive && <p className="text-sm text-gray-500 animate-pulse">{description}</p>}
      </div>
    </div>
  );
};

function EventExtractor() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [status, setStatus] = useState("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      icon: Clock,
      title: "Analyzing Prompt",
      description: "Extracting event details from your input...",
      key: "analyzing",
    },
    {
      icon: Mail,
      title: "Composing Event",
      description: "Structuring the event details...",
      key: "composing",
    },
    {
      icon: Send,
      title: "Accessing Calendar",
      description: "Connecting to Google Calendar...",
      key: "accessing",
    },
    {
      icon: CheckCircle2,
      title: "Event Created",
      description: "Your event has been successfully added!",
      key: "completed",
    },
  ];

  // Initialize Google API client on component mount
  useEffect(() => {
    const initGapiClient = () => {
      gapi.load("client:auth2", async () => {
        try {
          await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
          });

          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());

          // Listen for sign-in state changes
          authInstance.isSignedIn.listen((signedIn) => {
            setIsSignedIn(signedIn);
          });
        } catch (err) {
          console.error("Error initializing Google API client", err);
          setError("Failed to initialize Google API client");
        }
      });
    };

    if (window.gapi) {
      initGapiClient();
    } else {
      console.warn("Google API script not loaded. Make sure to include it.");
      setError("Google API script not loaded");
    }
  }, []);

  // Handle user sign-in
  const handleSignIn = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signIn().then(() => {
      setIsSignedIn(true);
      console.log("User signed in.");
    });
  };

  // Handle user sign-out
  const handleSignOut = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut().then(() => {
      setIsSignedIn(false);
      console.log("User signed out.");
    });
  };

  // Handle the process of extracting the event and creating it on the calendar
  const handleProcessEvent = async () => {
    if (!isSignedIn) {
      setError("Please sign in to Google first.");
      return;
    }

    const service = new EventExtractorService("AIzaSyDouKGIdQVnVXJg7AFTH36mehk6n25RAfg");
    setResult(null);
    setError(null);
    setIsLoading(true);
    setStatus("analyzing");
    setActiveStep(0);
    setCompletedSteps([]);

    try {
      // Step 1: Extract event details
      const extraction = await service.extractEventInfo(userInput);
      if (!extraction.is_calendar_event || extraction.confidence_score < 0.7) {
        throw new Error("This doesn't appear to be a calendar event request.");
      }

      setStatus("composing");
      setActiveStep(1);
      setCompletedSteps([0]);

      // Step 2: Parse detailed event information
      const details = await service.parseEventDetails(extraction.description);

      setStatus("accessing");
      setActiveStep(2);
      setCompletedSteps([0, 1]);

      // Step 3: Create the event in Google Calendar
      const calendarResponse = await createCalendarEvent(details);

      setStatus("completed");
      setActiveStep(3);
      setCompletedSteps([0, 1, 2]);

      // Step 4: Generate a natural confirmation message
      const confirmation = await service.generateConfirmation(details);
      confirmation.calendar_link = calendarResponse.result.htmlLink;
      setResult(confirmation);
    } catch (err) {
      console.error("Error processing event:", err);
      setError(err.message);
      setStatus("idle");
      setActiveStep(0);
      setCompletedSteps([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to insert a new event in Google Calendar
  const createCalendarEvent = async (eventDetails) => {
    const startDate = new Date(eventDetails.date);
    const endDate = new Date(startDate.getTime() + eventDetails.duration_minutes * 60000);

    const event = {
      summary: eventDetails.name,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Asia/Kolkata",
      },
    };

    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId: "aadityasalgaonkar@gmail.com",
        resource: event,
      });
      console.log("Event created successfully:", response);
      return response;
    } catch (err) {
      console.error("Error creating event:", err);
      throw err;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Event Extractor</h1>

      {!isSignedIn ? (
        <button
          onClick={handleSignIn}
          className="w-full px-4 py-2 mb-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Sign in with Google
        </button>
      ) : (
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 mb-4 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign out
        </button>
      )}

      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter event details (e.g., 'Let's schedule a 1-hour meeting on March 15 at 2:30 PM with Alice and Bob')"
        className="w-full p-2 border rounded mb-4"
        rows={4}
      />

      <button
        onClick={handleProcessEvent}
        disabled={isLoading || !isSignedIn}
        className={`w-full px-4 py-2 rounded ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {isLoading ? "Processing..." : "Process Event"}
      </button>

      {error && <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}

      {status !== "idle" && (
        <div className="mt-4  p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-center text-white">Event Creation Process</h2>
          <div className="relative pl-4 border-l-2 border-gray-200">
            {steps.map((step, index) => (
              <TimelineStep
                key={step.key}
                {...step}
                isActive={activeStep === index}
                isCompleted={completedSteps.includes(index)}
              />
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4  rounded text-white">
          <h2 className="font-bold text-white">Confirmation Details:</h2>
          <p>{result.confirmation_message}</p>
          {result.calendar_link && (
            <p className="mt-2">
              <strong className="text-white">Calendar Link:</strong>{" "}
              <a
                href={result.calendar_link}
                target="_blank"
                className="text-white"
                rel="noopener noreferrer"
              >
                {result.calendar_link}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default EventExtractor;