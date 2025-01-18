import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload,
  CheckCircleOutline,
  Close,
  AdminPanelSettings,
  Logout,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Verification = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [idCardFront, setIdCardFront] = useState(null);
  const [idCardBack, setIdCardBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  useEffect(() => {
    // Check if user is logged in and has pending verification
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (!token || !userData) {
      navigate("/");
      return;
    }

    const user = JSON.parse(userData);
    if (user.isVerified || user.verificationStatus !== "pending") {
      navigate("/");
      return;
    }

    setUser(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleFileChange = (side, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === "front") {
          setIdCardFront(file);
          setFrontPreview(reader.result);
        } else {
          setIdCardBack(file);
          setBackPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!idCardFront || !idCardBack) {
      setError("Lütfen kimliğinizin her iki yüzünü de yükleyin.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("idCardFront", idCardFront);
    formData.append("idCardBack", idCardBack);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/verification/submit`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage with new verification status
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        userData.verificationStatus = "submitted";
        localStorage.setItem("userData", JSON.stringify(userData));

        // Show success message
        setSuccess(true);
        setError("");
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          setError("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
          setTimeout(() => {
            localStorage.clear();
            window.location.href = "/";
          }, 2000);
        } else {
          setError(
            data.message || "Doğrulama işlemi sırasında bir hata oluştu."
          );
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        "Sunucu ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <Box className="min-h-screen bg-[#0f172a] relative overflow-hidden py-12">
      {/* Logout Button */}
      <Box className="absolute top-6 right-6 z-20">
        <Button
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-6 py-2 rounded-xl backdrop-blur-sm border border-red-500/20 transition-all duration-300 flex items-center gap-2"
          startIcon={<Logout />}
        >
          Çıkış Yap
        </Button>
      </Box>

      <Container maxWidth="md" className="relative z-10">
        <Paper className="p-8 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          {success ? (
            <Box className="text-center py-8 space-y-4">
              <Box className="bg-green-400/10 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <AdminPanelSettings className="text-6xl text-green-400" />
              </Box>
              <Typography variant="h5" className="text-gray-100 font-bold">
                Kimlik Bilgileriniz Başarıyla Gönderildi
              </Typography>
              <Typography className="text-gray-400 max-w-md mx-auto">
                Hesabınız admin tarafından incelendikten sonra aktif
                edilecektir. Bu süreç en fazla 24 saat sürebilir. Onay durumunu
                kontrol etmek için tekrar giriş yapabilirsiniz.
              </Typography>
              <Box className="flex justify-center mt-4">
                <CheckCircleOutline className="text-4xl text-green-400" />
              </Box>
            </Box>
          ) : (
            <>
              <Box className="text-center mb-8">
                <Typography
                  variant="h4"
                  className="text-gray-100 font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
                >
                  Hoş Geldin, {user?.username || "Kullanıcı"}
                </Typography>
                <Typography className="text-gray-400 max-w-lg mx-auto">
                  Hesabınızın güvenliği ve doğruluğunu sağlamak için kimlik
                  bilgilerinizi yüklemeniz gerekmektedir. Bu işlem sadece bir
                  kez yapılacaktır.
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  className="mb-6 bg-red-500/10 text-red-400 border border-red-500/20"
                  action={
                    <IconButton
                      color="inherit"
                      size="small"
                      onClick={() => setError("")}
                    >
                      <Close />
                    </IconButton>
                  }
                >
                  {error}
                </Alert>
              )}

              <Box className="grid md:grid-cols-2 gap-8">
                {/* Ön Yüz */}
                <Box className="space-y-4">
                  <Typography className="text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">
                      1
                    </span>
                    Kimlik Ön Yüzü
                  </Typography>
                  <Box
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                      frontPreview
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-gray-500 hover:border-blue-400 hover:bg-blue-500/5"
                    }`}
                    onClick={() => document.getElementById("frontId").click()}
                  >
                    {frontPreview ? (
                      <Box className="relative group">
                        <img
                          src={frontPreview}
                          alt="Ön yüz önizleme"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Box className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Typography className="text-white">
                            Değiştirmek için tıklayın
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box className="py-8">
                        <CloudUpload className="text-4xl text-gray-400 mb-2" />
                        <Typography className="text-gray-400">
                          Tıklayın veya dosyayı sürükleyin
                        </Typography>
                        <Typography className="text-gray-500 text-sm mt-2">
                          Maksimum dosya boyutu: 5MB
                        </Typography>
                      </Box>
                    )}
                    <input
                      type="file"
                      id="frontId"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange("front", e)}
                    />
                  </Box>
                </Box>

                {/* Arka Yüz */}
                <Box className="space-y-4">
                  <Typography className="text-gray-300 font-medium mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">
                      2
                    </span>
                    Kimlik Arka Yüzü
                  </Typography>
                  <Box
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                      backPreview
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-gray-500 hover:border-blue-400 hover:bg-blue-500/5"
                    }`}
                    onClick={() => document.getElementById("backId").click()}
                  >
                    {backPreview ? (
                      <Box className="relative group">
                        <img
                          src={backPreview}
                          alt="Arka yüz önizleme"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Box className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Typography className="text-white">
                            Değiştirmek için tıklayın
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box className="py-8">
                        <CloudUpload className="text-4xl text-gray-400 mb-2" />
                        <Typography className="text-gray-400">
                          Tıklayın veya dosyayı sürükleyin
                        </Typography>
                        <Typography className="text-gray-500 text-sm mt-2">
                          Maksimum dosya boyutu: 5MB
                        </Typography>
                      </Box>
                    )}
                    <input
                      type="file"
                      id="backId"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange("back", e)}
                    />
                  </Box>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading || !idCardFront || !idCardBack}
                className={`mt-8 py-3 px-8 rounded-xl transition-all duration-300 ${
                  loading || !idCardFront || !idCardBack
                    ? "bg-gray-600"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02]"
                }`}
              >
                {loading ? (
                  <Box className="flex items-center gap-3">
                    <CircularProgress size={24} className="text-white" />
                    <span>Gönderiliyor...</span>
                  </Box>
                ) : (
                  <Box className="flex items-center gap-2">
                    <span>Kimlik Bilgilerini Gönder</span>
                    {idCardFront && idCardBack && (
                      <CheckCircleOutline className="text-green-400" />
                    )}
                  </Box>
                )}
              </Button>
            </>
          )}
        </Paper>
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

export default Verification;
