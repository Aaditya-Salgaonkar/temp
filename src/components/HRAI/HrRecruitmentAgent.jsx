"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Bot,
  BotMessageSquare,
} from "lucide-react";
import HrRecruitmentService from "./hrRecruitmentService";
import { gapi } from "gapi-script";
import {
  Card,
  Typography,
  Button,
  TextField,
  Grid,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

// IMPORTANT: Move these to environment variables in production
const CLIENT_ID =
  "608829134548-k8skvvh5bo9cgh9savt95l28j47iqdi9.apps.googleusercontent.com";
const API_KEY = "AIzaSyDAsj4Ya-34WgI5qu9zZ-qrf0dNa-ZuueQ";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
];
const SCOPES = "https://www.googleapis.com/auth/gmail.send";

const agent = new HrRecruitmentService(
  "AIzaSyDouKGIdQVnVXJg7AFTH36mehk6n25RAfg"
);

// Define the TimelineStep component
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

const HrRecruitmentAgent = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      icon: Clock,
      title: "Uploading Resumes",
      description: "Processing the uploaded resumes...",
      key: "uploading",
    },
    {
      icon: FileText,
      title: "Evaluating Resumes",
      description: "Matching resumes with the job description...",
      key: "evaluating",
    },
    {
      icon: Send,
      title: "Sending Emails",
      description: "Sending interview emails to approved candidates...",
      key: "sending",
    },
    {
      icon: CheckCircle2,
      title: "Process Completed",
      description: "All steps completed successfully!",
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

  const handleSignIn = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signIn().then(() => {
      setIsSignedIn(true);
      console.log("User signed in.");
    });
  };

  const handleSignOut = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut().then(() => {
      setIsSignedIn(false);
      console.log("User signed out.");
    });
  };

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(uploadedFiles);
  };

  const handleEvaluateResumes = async () => {
    try {
      setStatus("uploading");
      setActiveStep(0);
      setCompletedSteps([]);

      // Step 1: Upload resumes
      const resumeContents = await agent.extractResumeContents(files);
      setStatus("evaluating");
      setActiveStep(1);
      setCompletedSteps([0]);

      // Step 2: Evaluate resumes
      const evaluationResults = await agent.evaluateResumes(
        resumeContents,
        jobDescription,
        keywords
      );
      setResults(evaluationResults);

      setStatus("sending");
      setActiveStep(2);
      setCompletedSteps([0, 1]);

      // Step 3: Send emails to approved candidates
      for (const result of evaluationResults) {
        if (result.status === "Approved" && result.email) {
          await sendEmail(
            result.email,
            "Interview Scheduling for Your Application",
            `
            Dear Candidate,

            Congratulations! Based on your resume, we are pleased to inform you that you have been shortlisted for an interview.

            Please reply to this email to confirm your availability for the interview.

            Best regards,
            HR Team
          `
          );
          console.log("Email sent to approved candidates.");
        }
      }

      setStatus("completed");

      setActiveStep(3);
      setCompletedSteps([0, 1, 2]);
    } catch (err) {
      console.error("Error evaluating resumes:", err);
      setError("Failed to evaluate resumes.");
    }
  };

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
      console.log(`Email sent to ${recipient}`);
    } catch (err) {
      console.error(`Error sending email to ${recipient}:`, err);
      throw err;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const initGapi = async () => {
        try {
          const gapi = await import("gapi-script").then((pack) => pack.gapi);

          await gapi.load("client:auth2", async () => {
            await gapi.client.init({
              apiKey: process.env.NEXT_PUBLIC_API_KEY,
              clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
              discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
              ],
              scope: "https://www.googleapis.com/auth/gmail.send",
            });

            const authInstance = gapi.auth2.getAuthInstance();
            setIsSignedIn(authInstance.isSignedIn.get());
            authInstance.isSignedIn.listen(setIsSignedIn);
          });
        } catch (err) {
          console.error("Error initializing Google API", err);
          setError("Failed to initialize Google API");
        }
      };

      if (!window.gapi) {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = initGapi;
        document.body.appendChild(script);
      } else {
        initGapi();
      }
    }
  }, []);

  const useGapi = () => {
    useEffect(() => {
      const loadGapi = async () => {
        const gapi = await import("gapi-script").then((pack) => pack.gapi);
        // Your gapi initialization code here
      };
      loadGapi();
    }, []);
  };

  return (
    <Card
      sx={{
        p: 3,
        width: "100%",
        maxWidth: "600px",
        backgroundColor: "#0f172a",
        borderRadius: "12px",
        border: "2px solid #ec4899",
        boxShadow: "0 0 10px #ec4899",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 0 20px #ec4899",
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
            background: "linear-gradient(to right, #ec4899, #f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          HR Recruitment Agent
        </Typography>
        <BotMessageSquare
          size={36}
          color="#ec4899"
          style={{
            filter: "drop-shadow(0 0 4px rgba(236, 72, 153, 0.7))",
          }}
        />
      </Box>

      <Typography variant="body2" sx={{ mb: 2, color: "#94a3b8" }}>
        Automatically evaluate resumes and contact candidates based on job
        requirements.
      </Typography>

      {/* Sign-in/Sign-out buttons */}

      {/* Job Description */}
      <TextField
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Enter the job description..."
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
              borderColor: "#ec4899",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ec4899",
              boxShadow: "0 0 0 2px rgba(236, 72, 153, 0.2)",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#94a3b8",
            opacity: 1,
          },
        }}
      />

      {/* Keywords */}
      <TextField
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="Enter keywords (comma-separated)..."
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
              borderColor: "#ec4899",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ec4899",
              boxShadow: "0 0 0 2px rgba(236, 72, 153, 0.2)",
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#94a3b8",
            opacity: 1,
          },
        }}
      />

      {/* File Upload */}
      <Button
        variant="outlined"
        component="label"
        fullWidth
        sx={{
          height: "44px",
          mb: 2,
          borderColor: "#ec4899",
          color: "#ec4899",
          "&:hover": {
            borderColor: "#f472b6",
            backgroundColor: "rgba(236, 72, 153, 0.1)",
          },
        }}
      >
        Upload Resumes
        <input
          type="file"
          multiple
          accept=".doc,.docx,.pdf"
          onChange={handleFileUpload}
          hidden
        />
      </Button>

      {files.length > 0 && (
        <Typography variant="body2" sx={{ mb: 2, color: "#94a3b8" }}>
          {files.length} file(s) selected
        </Typography>
      )}

      <Grid container sx={{ mb: 2 }}>
        <Grid item xs={12} md sx={{ display: "flex", flexGrow: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleEvaluateResumes}
            disabled={files.length === 0 || !jobDescription || !isSignedIn}
            sx={{
              height: "44px",
              minWidth: 0,
              background: "linear-gradient(to right, #ec4899, #f472b6)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(to right, #f472b6, #ec4899)",
                boxShadow: "0 0 15px rgba(236, 72, 153, 0.5)",
              },
              "&:disabled": {
                background: "#334155",
                color: "#64748b",
              },
            }}
          >
            Evaluate Resumes
          </Button>
        </Grid>
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "block" } }} />{" "}
        {/* Spacer - hidden on mobile */}
        <Grid item xs={12} md sx={{ display: "flex", flexGrow: 1 }}>
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
      {/* Evaluate Button */}

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
            borderLeft: "4px solid #ec4899",
          }}
        >
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#ffffff", textAlign: "center" }}
          >
            Recruitment Process
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

      {results.length > 0 && (
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
            Evaluation Results:
          </Typography>
          <List>
            {results.map((result, index) => (
              <ListItem
                key={index}
                sx={{
                  borderBottom: "1px solid #334155",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <ListItemText
                  primary={result.fileName}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        sx={{
                          display: "block",
                          color:
                            result.status === "Approved"
                              ? "#10b981"
                              : "#ef4444",
                        }}
                      >
                        Status: {result.status}
                      </Typography>
                      <Typography component="span" sx={{ display: "block" }}>
                        Email: {result.email || "Not Found"}
                      </Typography>
                    </>
                  }
                  sx={{ color: "#e2e8f0" }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Card>
  );
};

export default HrRecruitmentAgent;
