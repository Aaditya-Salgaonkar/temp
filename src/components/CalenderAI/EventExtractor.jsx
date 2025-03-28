"use client";
import React, { useState, useEffect } from "react";
import EventExtractorService from "./EventExtractorService";
import { gapi } from "gapi-script";
import {
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Send,
  Bot,
} from "lucide-react";
import {
  Card,
  Typography,
  Button,
  TextField,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";

const EventExtractor = ({ AGENT_ID, userName }) => {
  // Configuration (move to env in production)
  const CLIENT_ID =
    "608829134548-k8skvvh5bo9cgh9savt95l28j47iqdi9.apps.googleusercontent.com";
  const API_KEY = "AIzaSyDAsj4Ya-34WgI5qu9zZ-qrf0dNa-ZuueQ";
  const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ];
  const SCOPES = "https://www.googleapis.com/auth/calendar.events";

  // State
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [status, setStatus] = useState("idle");
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: Clock,
      title: "Analyzing",
      description: "Extracting event details...",
      color: "#0ea5e9",
    },
    {
      icon: CalendarIcon,
      title: "Structuring",
      description: "Organizing event components...",
      color: "#3b82f6",
    },
    {
      icon: Send,
      title: "Scheduling",
      description: "Adding to your calendar...",
      color: "#6366f1",
    },
    {
      icon: CheckCircle2,
      title: "Complete",
      description: "Event successfully created!",
      color: "#10b981",
    },
  ];

  // Initialize Google API
  useEffect(() => {
    const initClient = async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });

        const auth = gapi.auth2.getAuthInstance();
        setIsSignedIn(auth.isSignedIn.get());

        auth.isSignedIn.listen(setIsSignedIn);
      } catch (err) {
        console.error("Google API init error:", err);
        setError("Failed to initialize calendar service");
      }
    };

    if (window.gapi) {
      gapi.load("client:auth2", initClient);
    }
  }, []);

  const handleAuth = () => {
    const auth = gapi.auth2.getAuthInstance();
    isSignedIn ? auth.signOut() : auth.signIn();
  };

  const handleProcessEvent = async () => {
    if (!userInput.trim()) {
      setError("Please enter event details");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus("processing");
    setActiveStep(0);
    setResult(null);

    try {
      const service = new EventExtractorService(
        "AIzaSyDouKGIdQVnVXJg7AFTH36mehk6n25RAfg"
      );

      // Step 1: Analyze
      setActiveStep(0);
      const extraction = await service.extractEventInfo(userInput);
      if (!extraction.is_calendar_event || extraction.confidence_score < 0.7) {
        throw new Error("This doesn't appear to be a calendar event request");
      }

      // Step 2: Structure
      setActiveStep(1);
      const details = await service.parseEventDetails(extraction.description);

      // Step 3: Schedule
      setActiveStep(2);
      const calendarResponse = await createCalendarEvent(details);

      // Complete
      setActiveStep(3);
      setStatus("complete");

      const confirmation = await service.generateConfirmation(details);
      confirmation.calendar_link = calendarResponse.result.htmlLink;
      setResult(confirmation);
    } catch (err) {
      console.error("Event processing error:", err);
      setError(err.message);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

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

    return await gapi.client.calendar.events.insert({
      calendarId: "aadityasalgaonkar@gmail.com",
      resource: event,
    });
  };

  return (
    <Card
      sx={{
        p: 4,
        width: "100%",
        maxWidth: "600px",
        backgroundColor: "#0f172a",
        borderRadius: "12px",
        border: "2px solid #0ea5e9",
        boxShadow: "0 0 15px rgba(14, 165, 233, 0.5)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 0 25px rgba(14, 165, 233, 0.8)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(to right, #0ea5e9, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 8px rgba(14, 165, 233, 0.4)",
          }}
        >
          Event Extractor
        </Typography>
        <Bot
          size={36}
          color="#0ea5e9"
          style={{
            filter: "drop-shadow(0 0 6px rgba(14, 165, 233, 0.7))",
          }}
        />
      </Box>

      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: "#94a3b8",
          textShadow: "0 0 4px rgba(148, 163, 184, 0.3)",
        }}
      >
        Automatically extract and schedule events from your text
      </Typography>

      {/* Event Input */}
      <TextField
        fullWidth
        multiline
        rows={6}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter event details (e.g., 'Team meeting tomorrow at 2pm for 1 hour')"
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            color: "#e2e8f0",
            backgroundColor: "#1e293b",
            "& fieldset": {
              borderColor: "#334155",
              transition: "all 0.3s ease",
            },
            "&:hover fieldset": {
              borderColor: "#0ea5e9",
              boxShadow: "0 0 0 2px rgba(14, 165, 233, 0.2)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3b82f6",
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
            },
          },
          "& .MuiInputBase-input": {
            "&::placeholder": {
              color: "#94a3b8",
              opacity: 1,
            },
          },
        }}
      />

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={handleProcessEvent}
          disabled={!isSignedIn || isLoading || !userInput.trim()}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CalendarIcon size={20} />
            )
          }
          sx={{
            height: 44,
            background: "linear-gradient(to right, #0ea5e9, #3b82f6)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(to right, #3b82f6, #0ea5e9)",
              boxShadow: "0 0 15px rgba(14, 165, 233, 0.6)",
            },
            "&:disabled": {
              background: "#334155",
              color: "#64748b",
            },
          }}
        >
          {isLoading ? "Processing..." : "Schedule"}
        </Button>

        <Button
          fullWidth
          variant={isSignedIn ? "outlined" : "contained"}
          onClick={handleAuth}
          color={isSignedIn ? "error" : "success"}
          sx={{
            height: 44,
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
              boxShadow: isSignedIn
                ? "0 0 12px rgba(239, 68, 68, 0.4)"
                : "0 0 12px rgba(16, 185, 129, 0.4)",
            },
          }}
        >
          {isSignedIn ? "Sign Out" : "Sign In"}
        </Button>
      </Box>

      {/* Status Timeline */}
      {status !== "idle" && (
        <Box
          sx={{
            p: 3,
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            borderLeft: "4px solid #0ea5e9",
            boxShadow: "0 0 8px rgba(14, 165, 233, 0.3)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "#e2e8f0",
              textAlign: "center",
              textShadow: "0 0 6px rgba(226, 232, 240, 0.3)",
            }}
          >
            Event Status
          </Typography>

          <Divider
            sx={{
              borderColor: "#334155",
              mb: 2,
              boxShadow: "0 0 4px rgba(51, 65, 85, 0.5)",
            }}
          />

          <Box sx={{ pl: 2, borderLeft: "2px solid #334155" }}>
            {steps.map((step, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  opacity: activeStep >= index ? 1 : 0.5,
                  transition: "all 0.3s ease",
                }}
              >
                <Box
                  sx={{
                    mr: 2,
                    color: activeStep > index ? "#10b981" : step.color,
                    filter:
                      activeStep >= index
                        ? `drop-shadow(0 0 6px ${step.color}80)`
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  <step.icon size={24} />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: "medium",
                      color: "#e2e8f0",
                      textShadow:
                        activeStep >= index
                          ? `0 0 4px ${step.color}80`
                          : "none",
                    }}
                  >
                    {step.title}
                  </Typography>
                  {activeStep === index && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#94a3b8",
                        animation: "pulse 2s infinite",
                        textShadow: "0 0 4px rgba(148, 163, 184, 0.3)",
                      }}
                    >
                      {step.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Result Display */}
      {result && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            borderLeft: "4px solid #10b981",
            boxShadow: "0 0 8px rgba(16, 185, 129, 0.3)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "#e2e8f0",
              textShadow: "0 0 4px rgba(226, 232, 240, 0.3)",
            }}
          >
            Event Created
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#94a3b8",
              mb: 2,
            }}
          >
            {result.confirmation_message}
          </Typography>
          {result.calendar_link && (
            <Button
              variant="outlined"
              href={result.calendar_link}
              target="_blank"
              sx={{
                borderColor: "#3b82f6",
                color: "#3b82f6",
                "&:hover": {
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderColor: "#3b82f6",
                },
              }}
            >
              View in Calendar
            </Button>
          )}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "#1e293b",
            color: "#ef4444",
            borderRadius: "8px",
            borderLeft: "4px solid #ef4444",
            boxShadow: "0 0 8px rgba(239, 68, 68, 0.3)",
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}
    </Card>
  );
};

export default EventExtractor;