import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  KeyboardArrowRight,
  ArrowBack,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Token'ı ve kullanıcı rolünü localStorage'a kaydet
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userData", JSON.stringify(data.data.admin));

        // Kullanıcıyı dashboard'a yönlendir
        navigate(from, { replace: true });
      } else {
        setError(data.message || "Giriş başarısız");
      }
    } catch (err) {
      setError("Sunucu hatası. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Geri dönüş butonu */}
      <Box className="absolute top-0 left-0 p-6 z-20">
        <Button
          component={Link}
          to="/"
          className="bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 flex items-center gap-2 group"
        >
          <ArrowBack className="text-purple-400 transition-transform group-hover:-translate-x-1" />
          <span>Ana Sayfa</span>
        </Button>
      </Box>

      <Container maxWidth="lg" className="relative z-10">
        <Box className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-16 py-8">
          {/* Sol taraf - Başlık ve açıklama */}
          <Box className="flex-1 text-center md:text-left">
            <Box className="inline-block mb-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-2">
              <Typography className="text-purple-400 font-medium px-3 py-1">
                Admin Kontrol Paneli
              </Typography>
            </Box>
            <Typography
              variant="h1"
              component="h1"
              className="font-bold mb-6 text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400"
            >
              Sistem Yönetim
              <br />
              Merkezi
            </Typography>
            <Typography
              variant="h6"
              className="text-gray-400 max-w-xl leading-relaxed"
            >
              Tüm sistem ayarlarını yapılandırın, kullanıcıları yönetin ve
              platform güvenliğini kontrol edin.
            </Typography>
          </Box>

          {/* Sağ taraf - Giriş formu */}
          <Box className="w-full md:w-[450px]">
            <Box className="relative">
              {/* Arka plan efekti */}
              <Box className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30" />

              {/* Form container */}
              <Paper
                elevation={0}
                className="relative bg-[#1a2236] rounded-2xl overflow-hidden border border-white/10"
              >
                {/* Üst kısım dekorasyon */}
                <Box className="absolute top-0 inset-x-0">
                  <svg
                    className="w-full"
                    viewBox="0 0 400 150"
                    xmlns="http://www.w3.org/2000/svg"
                    height="150"
                  >
                    <path
                      fill="#1e293b"
                      d="M 0 0 L 400 0 L 400 150 Q 200 60 0 150 L 0 0"
                    />
                  </svg>
                </Box>

                {/* Form içeriği */}
                <Box className="p-8 pt-36 relative">
                  <Box className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-12">
                    <Box className="bg-gradient-to-r from-purple-500 to-pink-600 p-5 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                      <AdminPanelSettings className="text-white text-4xl" />
                    </Box>
                  </Box>

                  <Typography
                    variant="h5"
                    className="text-center mb-3 font-bold text-gray-100 text-2xl"
                  >
                    Admin Girişi
                  </Typography>

                  <Typography
                    variant="body2"
                    className="text-center mb-8 text-gray-400"
                  >
                    Sistem yönetici hesabınıza giriş yapın
                  </Typography>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <TextField
                      fullWidth
                      label="Kullanıcı Adı"
                      name="username"
                      variant="outlined"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person className="text-gray-400" />
                          </InputAdornment>
                        ),
                      }}
                      className="dark-input"
                    />

                    <TextField
                      fullWidth
                      label="Şifre"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock className="text-gray-400" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              className="text-gray-400 hover:text-gray-300"
                              disabled={loading}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      className="dark-input"
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      className="login-button bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 group transform hover:scale-[1.02] transition-all duration-300"
                    >
                      <span className="mr-2">
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                      </span>
                      <KeyboardArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Button>

                    <Box className="flex items-center justify-center pt-4">
                      <Link
                        to="/forgot-password"
                        className="py-3 px-8 rounded-xl border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 transition-all duration-300 text-sm text-center font-medium hover:scale-[1.02] min-w-[200px]"
                      >
                        Şifremi Unuttum
                      </Link>
                    </Box>
                  </form>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Animasyonlu arka plan desenleri */}
      <Box className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-red-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </Box>

      {/* Hata mesajı */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          variant="filled"
          className="bg-red-600"
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminLogin;
