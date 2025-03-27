import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";

function AIAgentCard({ title, icon: Icon, description }) {
  return (
    <Card
      sx={{
        backgroundColor: "#0f172a",
        borderRadius: "12px",
        border: "2px solid #0ea5e9",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 0 10px #0ea5e9",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 0 20px #0ea5e9",
        },
        "&:active": {
          transform: "translateY(0)",
          boxShadow: "0 0 15px #0ea5e9",
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(to right, #0ea5e9, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </Typography>
          <IconButton sx={{ color: "#0ea5e9" }}>
            <Icon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="grey.400" mt={1}>
          {description}
        </Typography>
        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 2,
            background: "linear-gradient(to right, #0ea5e9, #3b82f6)",
            color: "#fff",
            "&:hover": {
              background: "linear-gradient(to right, #3b82f6, #0ea5e9)",
              boxShadow: "0 0 15px #0ea5e9",
            },
            "&:active": {
              transform: "scale(0.98)",
              boxShadow: "0 0 10px #0ea5e9",
            },
          }}
        >
          Purchase
        </Button>
      </CardContent>
    </Card>
  );
}

export default AIAgentCard;
