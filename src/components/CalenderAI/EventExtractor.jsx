import React, { useState, useEffect } from "react";
import EventExtractorService from "./EventExtractorService";
import { gapi } from "gapi-script";
import { CheckCircle2, Clock, Mail, Send, Bot } from "lucide-react";
import { Card, Typography, Button, TextField, Grid, Box } from "@mui/material";

// IMPORTANT: Store these in environment variables in production
const CLIENT_ID =
  "608829134548-k8skvvh5bo9cgh9savt95l28j47iqdi9.apps.googleusercontent.com";
const API_KEY = "AIzaSyDAsj4Ya-34WgI5qu9zZ-qrf0dNa-ZuueQ";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const TimelineStep = ({
  icon: Icon,
  title,
  description,
  isActive,
  isCompleted,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 2,
        transition: "all 0.5s ease-in-out",
        opacity: isActive ? 1 : 0.5,
      }}
    >
      <Box sx={{ mr: 2, color: isCompleted ? "#10b981" : "#64748b" }}>
        <Icon size={24} />
      </Box>
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "medium", color: isActive ? "#ffffff" : "#94a3b8" }}
        >
          {title}
        </Typography>
        {isActive && (
          <Typography
            variant="body2"
            sx={{ color: "#94a3b8", animation: "pulse 2s infinite" }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Box>
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

    const service = new EventExtractorService(
      "AIzaSyDouKGIdQVnVXJg7AFTH36mehk6n25RAfg"
    );
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
    const endDate = new Date(
      startDate.getTime() + eventDetails.duration_minutes * 60000
    );

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
    <Card
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "600px",
        backgroundColor: "#0f172a",
        borderRadius: "12px",
        border: "2px solid #0ea5e9",
        boxShadow: "0 0 10px #0ea5e9",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 0 20px #0ea5e9",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pl: 1,
          pr: 1,
          mb: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(to right, #0ea5e9, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Calendar Agent
        </Typography>
        <Bot
          size={36}
          color="#0ea5e9"
          style={{
            filter: "drop-shadow(0 0 4px rgba(14, 165, 233, 0.7))",
          }}
        />
      </Box>

      <Typography variant="body2" sx={{ mb: 2, color: "#94a3b8" }}>
        Automatically extract and add events to your calendar from natural
        language.
      </Typography>

      <TextField
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter event details (e.g., 'Let's schedule a 1-hour meeting on March 15 at 2:30 PM with Alice and Bob')"
        multiline
        rows={4}
        fullWidth
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            color: "#e2e8f0",
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            "& fieldset": {
              borderColor: "#334155",
            },
            "&:hover fieldset": {
              borderColor: "#0ea5e9",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0ea5e9",
              boxShadow: "0 0 0 2px rgba(14, 165, 233, 0.2)",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#94a3b8",
            opacity: 1,
          },
        }}
      />

      <Grid
        container
        justifyContent="space-around"
        alignItems="center"
        sx={{ mb: 2, gap: 2 }}
      >
        <Grid item xs={12} md="auto" sx={{ width: { xs: "100%", md: "45%" } }}>
          <Button
            fullWidth
            disabled={isLoading || !isSignedIn}
            variant="contained"
            onClick={handleProcessEvent}
            sx={{
              height: "44px",
              minWidth: "200px", // Set minimum width
              background: "linear-gradient(to right, #0ea5e9, #3b82f6)",
              color: "#fff",
              "&:hover": {
                background: !isLoading
                  ? "linear-gradient(to right, #3b82f6, #0ea5e9)"
                  : "#7c3aed",
                boxShadow: "0 0 15px rgba(14, 165, 233, 0.5)",
              },
              "&:disabled": {
                background: "#334155",
                color: "#64748b",
              },
            }}
          >
            {isLoading ? "Processing..." : "Process Event"}
          </Button>
        </Grid>
        <Grid item xs={12} md="auto" sx={{ width: { xs: "100%", md: "45%" } }}>
          {!isSignedIn ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleSignIn}
              sx={{
                height: "44px",
                minWidth: "200px", // Same minimum width
                backgroundColor: "#10b981",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#059669",
                  boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)",
                },
              }}
            >
              Sign in with Google
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={handleSignOut}
              sx={{
                height: "44px",
                minWidth: "200px", // Same minimum width
                backgroundColor: "#ef4444",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#dc2626",
                  boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)",
                },
              }}
            >
              Sign out
            </Button>
          )}
        </Grid>
      </Grid>

      {error && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "6px",
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      {status !== "idle" && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            borderLeft: "4px solid #0ea5e9",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#ffffff", textAlign: "center" }}
          >
            Event Creation Process
          </Typography>
          <Box sx={{ pl: 2, borderLeft: "2px solid #334155" }}>
            {steps.map((step, index) => (
              <TimelineStep
                key={step.key}
                {...step}
                isActive={activeStep === index}
                isCompleted={completedSteps.includes(index)}
              />
            ))}
          </Box>
        </Box>
      )}

      {result && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            color: "#ffffff",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            Confirmation Details:
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {result.confirmation_message}
          </Typography>
          {result.calendar_link && (
            <Typography variant="body2">
              <Box component="span" sx={{ fontWeight: "bold" }}>
                Calendar Link:{" "}
              </Box>
              <Box
                component="a"
                href={result.calendar_link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "#0ea5e9",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                title={result.calendar_link} // Show full URL on hover
              >
                {result.calendar_link.length > 40
                  ? `${result.calendar_link.substring(0, 40)}...`
                  : result.calendar_link}
              </Box>
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );
}

export default EventExtractor;
