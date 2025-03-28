"use client";
import React, { useState, useEffect } from "react";
import EmailAgentService from "./emailAgentService";
import { gapi } from "gapi-script";
import { CheckCircle2, Clock, Mail, Send, Bot } from "lucide-react";
import {
  Card,
  Typography,
  Button,
  TextField,
  Grid,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";

const EmailAgent = () => {
  // Configuration (move to env in production)
  const CLIENT_ID =
    "608829134548-k8skvvh5bo9cgh9savt95l28j47iqdi9.apps.googleusercontent.com";
  const API_KEY = "AIzaSyDAsj4Ya-34WgI5qu9zZ-qrf0dNa-ZuueQ";
  const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
  ];
  const SCOPES = "https://www.googleapis.com/auth/gmail.send";

  // State
  const [input, setInput] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const agent = new EmailAgentService(
    "AIzaSyDouKGIdQVnVXJg7AFTH36mehk6n25RAfg"
  );

  const steps = [
    {
      icon: Clock,
      title: "Analyzing",
      description: "Processing your email request...",
      color: "#8b5cf6",
    },
    {
      icon: Mail,
      title: "Generating",
      description: "Creating professional email content...",
      color: "#7c3aed",
    },
    {
      icon: Send,
      title: "Sending",
      description: "Delivering your message...",
      color: "#6d28d9",
    },
    {
      icon: CheckCircle2,
      title: "Complete",
      description: "Email successfully sent!",
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
        setError("Failed to initialize email service");
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

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError("Please enter your email content");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("processing");
    setActiveStep(0);

    try {
      // Step 1: Analyze
      setActiveStep(0);
      const emailContent = await agent.generateResponse(input);

      // Step 2: Generate
      setActiveStep(1);
      const subject =
        emailContent.match(/Subject:\s*(.+)/i)?.[1] || "Your Message";
      const body = emailContent.match(/Email body:\s*([\s\S]+)/i)?.[1] || input;

      // Step 3: Send
      setActiveStep(2);
      await sendEmail("aadityasalgaonkar@gmail.com", subject, body);

      // Complete
      setActiveStep(3);
      setStatus("complete");
      setInput("");
    } catch (err) {
      console.error("Email error:", err);
      setError(err.message || "Failed to process email");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (to, subject, body) => {
    const email = [`To: ${to}`, `Subject: ${subject}`, "", body].join("\n");

    const base64Email = btoa(email)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gapi.client.gmail.users.messages.send({
      userId: "me",
      resource: { raw: base64Email },
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
        border: "2px solid #7c3aed",
        boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 0 25px rgba(124, 58, 237, 0.8)",
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
            background: "linear-gradient(to right, #8b5cf6, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 8px rgba(139, 92, 246, 0.4)",
          }}
        >
          Email Agent
        </Typography>
        <Bot
          size={36}
          color="#8b5cf6"
          style={{
            filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.7))",
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
        Create and send professional emails instantly
      </Typography>

      {/* Email Input */}
      <TextField
        fullWidth
        multiline
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe the email you want to send..."
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
              borderColor: "#7c3aed",
              boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.2)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#8b5cf6",
              boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.3)",
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
          onClick={handleSubmit}
          disabled={!isSignedIn || loading || !input.trim()}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Send size={20} />
            )
          }
          sx={{
            height: 44,
            background: "linear-gradient(to right, #7c3aed, #8b5cf6)",
            color: "white",
            "&:hover": {
              background: "linear-gradient(to right, #8b5cf6, #7c3aed)",
              boxShadow: "0 0 15px rgba(124, 58, 237, 0.6)",
            },
            "&:disabled": {
              background: "#334155",
              color: "#64748b",
            },
          }}
        >
          {loading ? "Processing..." : "Send Email"}
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
            borderLeft: "4px solid #7c3aed",
            boxShadow: "0 0 8px rgba(124, 58, 237, 0.3)",
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
            Email Status
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

export default EmailAgent;