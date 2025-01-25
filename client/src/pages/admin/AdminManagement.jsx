import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const ManagerManagement = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Yönetici Yönetimi
      </Typography>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1">
          Yönetici yönetimi sayfası yapım aşamasındadır.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ManagerManagement;
