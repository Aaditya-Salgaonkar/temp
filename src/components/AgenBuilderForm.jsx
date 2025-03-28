import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Bot, Plus, Loader2, CheckCircle2 } from "lucide-react";
import {
  Card,
  Typography,
  Button,
  TextField,
  Box,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
} from "@mui/material";

// Hardcoded Supabase keys
const SUPABASE_URL = "https://mbzjjnszzzwbyngcdqyk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iempqbnN6enp3YnluZ2NkcXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5Njk3NjEsImV4cCI6MjA1ODU0NTc2MX0.BCwHIqvr6k0xDRrzcuNC6jr1G7q1m9QhnLzEl6KEY1k";

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AgentBuilderForm = () => {
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState("");
  const [price, setPrice] = useState("");
  const [additionalData, setAdditionalData] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const agentTypes = ["hr", "email", "calender", "emailSummary"];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setError("No active session found. Please log in.");
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        setError("User not authenticated. Please log in.");
      } else if (data?.user) {
        setUserId(data.user.id);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!agentName) {
      setError("Please enter the name of the agent.");
      setLoading(false);
      return;
    }
    if (!agentType) {
      setError("Please select an agent type.");
      setLoading(false);
      return;
    }
    if (!price || isNaN(price) || price <= 0) {
      setError("Please enter a valid price.");
      setLoading(false);
      return;
    }
    if (!userId) {
      setError("User not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    setError(null);
    setSuccess(false);

    const formData = {
      name: agentName,
      agent_type: agentType,
      amount: parseFloat(price),
      finetuning_data: additionalData || null,
      user_id: userId,
    };

    try {
      const { data, error } = await supabase.from("agents").insert([formData]);

      if (error) {
        console.error("Error inserting data:", error);
        setError("Failed to create the agent. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Data inserted successfully:", data);
      setSuccess(true);
      // Reset form
      setAgentName("");
      setAgentType("");
      setPrice("");
      setAdditionalData("");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
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
        border: "2px solid #7c3aed",
        boxShadow: "0 0 10px #7c3aed",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 0 20px #7c3aed",
        },
      }}
    >
      {/* Header */}
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
            background: "linear-gradient(to right, #7c3aed, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Create Custom Agent
        </Typography>
        <Bot
          size={36}
          color="#7c3aed"
          style={{ filter: "drop-shadow(0 0 4px rgba(124, 58, 237, 0.7))" }}
        />
      </Box>

      <Typography variant="body2" sx={{ mb: 3, color: "#94a3b8" }}>
        Configure your AI agent with custom settings and fine-tuning data.
      </Typography>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        {/* Agent Name */}
        <TextField
          fullWidth
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          label="Agent Name"
          placeholder="Enter agent name"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              color: "#e2e8f0",
              backgroundColor: "#1e293b",
              "& fieldset": {
                borderColor: "#334155",
              },
              "&:hover fieldset": {
                borderColor: "#7c3aed",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#7c3aed",
                boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.2)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#94a3b8",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#8b5cf6",
            },
          }}
        />

        {/* Agent Type */}
        <Select
          fullWidth
          value={agentType}
          onChange={(e) => setAgentType(e.target.value)}
          displayEmpty
          sx={{
            mb: 2,
            color: "#e2e8f0",
            backgroundColor: "#1e293b",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#334155",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#7c3aed",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#7c3aed",
              boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.2)",
            },
            "& .MuiSvgIcon-root": {
              color: "#94a3b8",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "#1e293b",
                color: "#e2e8f0",
                "& .MuiMenuItem-root": {
                  "&:hover": {
                    backgroundColor: "rgba(124, 58, 237, 0.1)",
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            <em>Select agent type</em>
          </MenuItem>
          {agentTypes.map((type, index) => (
            <MenuItem key={index} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>

        {/* Price */}
        <TextField
          fullWidth
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          label="Price (USD)"
          placeholder="0.00"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              color: "#e2e8f0",
              backgroundColor: "#1e293b",
              "& fieldset": {
                borderColor: "#334155",
              },
              "&:hover fieldset": {
                borderColor: "#7c3aed",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#7c3aed",
                boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.2)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#94a3b8",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#8b5cf6",
            },
          }}
        />

        {/* Additional Data */}
        <TextField
          fullWidth
          multiline
          rows={4}
          value={additionalData}
          onChange={(e) => setAdditionalData(e.target.value)}
          label="Fine-tuning Data (Optional)"
          placeholder="Enter JSON or text data to customize your agent"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              color: "#e2e8f0",
              backgroundColor: "#1e293b",
              "& fieldset": {
                borderColor: "#334155",
              },
              "&:hover fieldset": {
                borderColor: "#7c3aed",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#7c3aed",
                boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.2)",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#94a3b8",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#8b5cf6",
            },
          }}
        />

        {/* Status Messages */}
        {error && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "#1e293b",
              color: "#ef4444",
              borderRadius: "8px",
              borderLeft: "4px solid #ef4444",
            }}
          >
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        {success && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: "#1e293b",
              color: "#10b981",
              borderRadius: "8px",
              borderLeft: "4px solid #10b981",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CheckCircle2 size={20} />
            <Typography variant="body2">Agent created successfully!</Typography>
          </Box>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Plus size={20} />
            )
          }
          sx={{
            height: "44px",
            background: "linear-gradient(to right, #7c3aed, #8b5cf6)",
            color: "#fff",
            "&:hover": {
              background: "linear-gradient(to right, #8b5cf6, #7c3aed)",
              boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)",
            },
            "&:disabled": {
              background: "#334155",
              color: "#64748b",
            },
          }}
        >
          {loading ? "Creating..." : "Create Agent"}
        </Button>
      </Box>
    </Card>
  );
};

export default AgentBuilderForm;