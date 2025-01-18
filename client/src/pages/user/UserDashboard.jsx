import React from "react";
import { Box, Container, Grid, Paper, Typography } from "@mui/material";

const UserDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Grid container spacing={3}>
          {/* Financial Summary */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Finansal Özet
              </Typography>
              {/* ... existing financial summary content ... */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UserDashboard;
