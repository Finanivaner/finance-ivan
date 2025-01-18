import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ArrowBack,
} from "@mui/icons-material";

const LoginForm = ({ role, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({ ...formData, role });
    } catch (err) {
      setError(err.message || "Giriş yapılırken bir hata oluştu");
    }
  };

  const roleTitle = {
    admin: "Admin",
    manager: "Müdür",
    user: "Kullanıcı",
  }[role];

  return (
    <Paper elevation={3} className="p-8 max-w-md mx-auto mt-8 glass-morphism">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/")}
        className="mb-4"
      >
        Ana Sayfaya Dön
      </Button>

      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        className="font-bold text-gray-800"
      >
        {roleTitle} Girişi
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          fullWidth
          label="E-posta"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Şifre"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          className="mt-6"
        >
          Giriş Yap
        </Button>
      </form>
    </Paper>
  );
};

export default LoginForm;
