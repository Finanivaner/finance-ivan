import React from "react";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import UserManagement from "../../components/admin/UserManagement";
import DeliveryManagement from "./DeliveryManagement";

const AdminDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Grid container spacing={3}>
          {/* User Management */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <UserManagement />
            </Paper>
          </Grid>

          {/* Delivery Management */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <DeliveryManagement />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
