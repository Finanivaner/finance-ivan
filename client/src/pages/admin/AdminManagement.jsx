import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const AdminManagement = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Admin Yönetimi
      </Typography>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1">
          Admin yönetimi sayfası yapım aşamasındadır.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminManagement;
