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
} from "@mui/material";
import {
  Lock,
  Visibility,
  VisibilityOff,
  SupervisorAccount,
  AdminPanelSettings,
  KeyboardArrowRight,
  LoginOutlined,
  ChevronRight,
  Email,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, role: "user" }),
      });

      const responseData = await response.json();
      console.log("Login response:", responseData);

      // For unverified users (403)
      if (response.status === 403) {
        if (responseData.error?.token && responseData.error?.user) {
          localStorage.setItem("token", responseData.error.token);
          localStorage.setItem("userRole", responseData.error.user.role);
          localStorage.setItem(
            "userData",
            JSON.stringify(responseData.error.user)
          );
          navigate("/verification", { replace: true });
        }
        setError(responseData.message);
        return;
      }

      // For verified users (200)
      if (response.ok && responseData.success && responseData.data) {
        const { token, user } = responseData.data;
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userData", JSON.stringify(user));

        if (user.isVerified && user.verificationStatus === "approved") {
          navigate("/dashboard", { replace: true });
          return;
        }
      }

      // Handle other error cases
      setError(responseData.message || "Giriş yapılırken bir hata oluştu");
    } catch (error) {
      console.error("Login hatası:", error);
      setError(
        "Sunucuya bağlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Üst menü */}
      <Box className="absolute top-0 right-0 p-6 z-20 flex gap-4">
        <Button
          component={Link}
          to="/manager/login"
          className="bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 flex items-center gap-2 group"
        >
          <SupervisorAccount className="text-blue-400" />
          <span>Müdür Girişi</span>
          <ChevronRight className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
        </Button>
        <Button
          component={Link}
          to="/admin/login"
          className="bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 flex items-center gap-2 group"
        >
          <AdminPanelSettings className="text-purple-400" />
          <span>Admin Girişi</span>
          <ChevronRight className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
        </Button>
      </Box>

      <Container maxWidth="lg" className="relative z-10">
        <Box className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-16 py-8">
          {/* Sol taraf - Başlık ve açıklama */}
          <Box className="flex-1 text-center md:text-left">
            <Box className="inline-block mb-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-2">
              <Typography className="text-blue-400 font-medium px-3 py-1">
                Finans Yönetim Platformu
              </Typography>
            </Box>
            <Typography
              variant="h1"
              component="h1"
              className="font-bold mb-6 text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"
            >
              Finansal İşlemlerinizi
              <br />
              Güvenle Yönetin
            </Typography>
            <Typography
              variant="h6"
              className="text-gray-400 max-w-xl leading-relaxed"
            >
              Modern ve güvenli finans yönetim platformu ile işlemlerinizi
              kolayca takip edin, raporlayın ve yönetin.
            </Typography>
          </Box>

          {/* Sağ taraf - Giriş formu */}
          <Box className="w-full md:w-[450px]">
            <Box className="relative">
              {/* Arka plan efekti */}
              <Box className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" />

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
                    <Box className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                      <LoginOutlined className="text-white text-4xl" />
                    </Box>
                  </Box>

                  <Typography
                    variant="h5"
                    className="text-center mb-3 font-bold text-gray-100 text-2xl"
                  >
                    Kullanıcı Girişi
                  </Typography>

                  <Typography
                    variant="body2"
                    className="text-center mb-8 text-gray-400"
                  >
                    Hesabınıza giriş yaparak işlemlerinizi yönetin
                  </Typography>

                  {successMessage && (
                    <Alert
                      severity="success"
                      className="mb-4"
                      onClose={() => setSuccessMessage("")}
                    >
                      {successMessage}
                    </Alert>
                  )}

                  {error && (
                    <Typography className="text-red-400 text-center mb-4 p-3 bg-red-400/10 rounded-lg">
                      {error}
                    </Typography>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <TextField
                      fullWidth
                      label="E-posta"
                      name="email"
                      type="email"
                      variant="outlined"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email className="text-gray-400" />
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
                      className="login-button bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 group transform hover:scale-[1.02] transition-all duration-300"
                    >
                      <span className="mr-2">
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                      </span>
                      <KeyboardArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Button>

                    <Box className="flex items-center justify-center gap-4 pt-4">
                      <Link
                        to="/forgot-password"
                        className="py-3 px-8 rounded-xl border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 transition-all duration-300 text-sm text-center font-medium hover:scale-[1.02]"
                      >
                        Şifremi Unuttum
                      </Link>
                      <Link
                        to="/register"
                        className="py-3 px-8 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300 text-sm text-center font-medium hover:scale-[1.02]"
                      >
                        Hesap Oluştur
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
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </Box>
    </Box>
  );
};

export default LandingPage;
