"use client";
import React, { useState, useEffect } from "react";
import EmailAgentService from "./emailAgentService";
import { gapi } from "gapi-script";
import { CheckCircle2, Clock, Mail, Send, Bot } from "lucide-react";
import { Card, Typography, Button, TextField, Grid, Box } from "@mui/material";

// IMPORTANT: Move these to environment variables in production
const CLIENT_ID =
  "608829134548-k8skvvh5bo9cgh9savt95l28j47iqdi9.apps.googleusercontent.com";
const API_KEY = "AIzaSyDAsj4Ya-34WgI5qu9zZ-qrf0dNa-ZuueQ";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
];
const SCOPES = "https://www.googleapis.com/auth/gmail.send";

const agent = new EmailAgentService("AIzaSyDouKGIdQVnVXJg7AFTH36mehk6n25RAfg");

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

const EmailAgent = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      icon: Clock,
      title: "Analyzing Prompt",
      description: "Processing your input to generate an email...",
      key: "analyzing",
    },
    {
      icon: Mail,
      title: "Generating Email",
      description: "Creating a professional email response...",
      key: "generating",
    },
    {
      icon: Send,
      title: "Sending Email",
      description: "Sending the email to the recipient...",
      key: "sending",
    },
    {
      icon: CheckCircle2,
      title: "Email Sent",
      description: "Your email has been successfully sent!",
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

  // Handle email generation and sending
  const handleGenerateAndSend = async () => {
    const emailId = "aadityasalgaonkar@gmail.com";
    try {
      setStatus("analyzing");
      setActiveStep(0);
      setCompletedSteps([]);

      const generatedResponse = await agent.generateResponse(input);
      setResponse(generatedResponse);

      setStatus("generating");
      setActiveStep(1);
      setCompletedSteps([0]);

      // Extract subject and body from the generated response
      const subjectMatch = generatedResponse.match(/Subject:\s*(.+)/i);
      const bodyMatch = generatedResponse.match(/Email body:\s*([\s\S]+)/i);
      const subject = subjectMatch ? subjectMatch[1].trim() : "No Subject";
      const body = bodyMatch ? bodyMatch[1].trim() : "No Email Body";

      setStatus("sending");
      setActiveStep(2);
      setCompletedSteps([0, 1]);

      // Send the email using Gmail API
      await sendEmail(emailId, subject, body);

      setStatus("completed");
      setActiveStep(3);
      setCompletedSteps([0, 1, 2]);
    } catch (err) {
      console.error("Error generating or sending email:", err);
      setError("Failed to generate or send email.");
    }
  };

  // Function to send email using Gmail API
  const sendEmail = async (recipient, subject, body) => {
    const email = [`To: ${recipient}`, `Subject: ${subject}`, "", body].join(
      "\n"
    );

    const encodedMessage = btoa(email)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    try {
      await gapi.client.gmail.users.messages.send({
        userId: "me",
        resource: {
          raw: encodedMessage,
        },
      });
    } catch (err) {
      console.error("Error sending email via Gmail API:", err);
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
        border: "2px solid #8b5cf6", // Purple border for Email Agent
        boxShadow: "0 0 10px #8b5cf6",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 0 20px #8b5cf6",
        },
      }}
    >
      {/* Header with icon */}
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
            background: "linear-gradient(to right, #8b5cf6, #c084fc)", // Purple gradient
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Email Agent
        </Typography>
        <Bot
          size={36}
          color="#8b5cf6" // Purple icon
          style={{
            filter: "drop-shadow(0 0 4px rgba(139, 92, 246, 0.7))",
          }}
        />
      </Box>

      <Typography variant="body2" sx={{ mb: 2, color: "#94a3b8" }}>
        Automatically generate and send professional emails from simple prompts.
      </Typography>

      {/* Sign-in/Sign-out buttons */}

      {/* Input field */}
      <TextField
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your email prompt..."
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
              borderColor: "#8b5cf6",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#8b5cf6",
              boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.2)",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#94a3b8",
            opacity: 1,
          },
        }}
      />

      {/* Generate and Send button */}
      <Grid spacing={3} container sx={{ mb: 2 }}>
        <Grid item xs={12} md sx={{ display: "flex", flexGrow: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleGenerateAndSend}
            disabled={!isSignedIn || !input}
            sx={{
              height: "44px",
              minWidth: 0,
              background: "linear-gradient(to right, #8b5cf6, #c084fc)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(to right, #c084fc, #8b5cf6)",
                boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
              },
              "&:disabled": {
                background: "#334155",
                color: "#64748b",
              },
            }}
          >
            Generate and Send Email
          </Button>
        </Grid>
        <Grid item xs={12} md="auto" sx={{ display: "flex", flexGrow: 1 }}>
          {!isSignedIn ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleSignIn}
              sx={{
                height: "44px",
                minWidth: 0,
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
                minWidth: 0,
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
            borderLeft: "4px solid #8b5cf6",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#ffffff", textAlign: "center" }}
          >
            Email Sending Process
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
    </Card>
  );
};

export default EmailAgent;
