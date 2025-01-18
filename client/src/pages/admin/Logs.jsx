import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Logs = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Log Kayıtları
      </Typography>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1">
          Log kayıtları sayfası yapım aşamasındadır.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Logs;
