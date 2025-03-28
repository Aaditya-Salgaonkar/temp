"use client";
import React, { useState, useEffect } from "react";
import { gapi } from "gapi-script";
import { CheckCircle2, Clock, Mail } from "lucide-react";
import EmailSummaryService from "./emailSummaryService";
import {
  Card,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  Divider,
  Grid,
} from "@mui/material";

// IMPORTANT: Move these to environment variables in production
const CLIENT_ID =
  "608829134548-k8skvvh5bo9cgh9savt95l28j47iqdi9.apps.googleusercontent.com";
const API_KEY = "AIzaSyDAsj4Ya-34WgI5qu9zZ-qrf0dNa-ZuueQ";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
];
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

const agent = new EmailSummaryService(
  "AIzaSyDouKGIdQVnVXJg7AFTH36mehk6n25RAfg"
);

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
        transition: "all 0.5s ease",
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

const EmailSummaryAgent = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [summaries, setSummaries] = useState([]);

  const steps = [
    {
      icon: Clock,
      title: "Fetching Emails",
      description: "Retrieving the latest 5 emails from your inbox...",
      key: "fetching",
    },
    {
      icon: List,
      title: "Summarizing Emails",
      description: "Generating summaries for the retrieved emails...",
      key: "summarizing",
    },
    {
      icon: CheckCircle2,
      title: "Summaries Ready",
      description: "Your email summaries are ready!",
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

  // Handle fetching and summarizing emails
  const handleFetchAndSummarize = async () => {
    try {
      setStatus("fetching");
      setActiveStep(0);
      setCompletedSteps([]);

      // Fetch the latest 5 emails
      const emails = await fetchEmails();
      setStatus("summarizing");
      setActiveStep(1);
      setCompletedSteps([0]);

      // Summarize the emails
      const emailSummaries = await agent.summarizeEmails(emails);
      setSummaries(emailSummaries);

      setStatus("completed");
      setActiveStep(2);
      setCompletedSteps([0, 1]);
    } catch (err) {
      console.error("Error fetching or summarizing emails:", err);
      setError("Failed to fetch or summarize emails.");
    }
  };

  // Function to fetch the latest 5 emails using Gmail API
  const fetchEmails = async () => {
    try {
      const response = await gapi.client.gmail.users.messages.list({
        userId: "me",
        maxResults: 5,
        q: "",
      });

      const messages = response.result.messages || [];
      const emailPromises = messages.map(async (message) => {
        const email = await gapi.client.gmail.users.messages.get({
          userId: "me",
          id: message.id,
        });
        return email.result;
      });

      return Promise.all(emailPromises);
    } catch (err) {
      console.error("Error fetching emails:", err);
      throw err;
    }
  };

  return (
    <Card
      sx={{
        p: 4,
        width: "100%",
        maxWidth: "600px",
        backgroundColor: "#0f172a",
        borderRadius: "12px",
        border: "2px solid #10b981",
        boxShadow: "0 0 10px #10b981",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 0 20px #10b981",
        },
      }}
    >
      {/* Header with icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(to right, #10b981, #059669)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Email Agent
        </Typography>
        <Mail
          size={36}
          color="#10b981"
          style={{ filter: "drop-shadow(0 0 4px rgba(139, 92, 246, 0.7))" }}
        />
      </Box>

      <Typography variant="body2" sx={{ mb: 3.5, color: "#94a3b8" }}>
        Automatically fetch and summarize your latest emails.
      </Typography>

      <Grid
        container
        justifyContent={"space-around"}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleFetchAndSummarize}
            disabled={!isSignedIn}
            sx={{
              height: "44px",
              background: "linear-gradient(to right, #10b981, #059669)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(to right, #059669, #10b981)",
                boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)",
              },
              "&:disabled": {
                background: "#334155",
                color: "#64748b",
              },
            }}
          >
            Summarize
          </Button>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          {!isSignedIn ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleSignIn}
              sx={{
                height: "44px",
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
            borderLeft: "4px solid #10b981",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#ffffff", textAlign: "center" }}
          >
            Email Summarization Process
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

      {summaries.length > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            color: "#ffffff",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Email Summaries:
          </Typography>
          <List>
            {summaries.map((summary, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ py: 1.5 }}>
                  <Typography variant="body1" sx={{ color: "#e2e8f0" }}>
                    {summary}
                  </Typography>
                </ListItem>
                {index < summaries.length - 1 && (
                  <Divider sx={{ backgroundColor: "#334155" }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Card>
  );
};

export default EmailSummaryAgent;
