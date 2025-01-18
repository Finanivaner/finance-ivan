import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { LockReset } from "@mui/icons-material";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Şifre sıfırlama mantığı burada uygulanacak
    console.log("Şifre sıfırlama isteği gönderildi:", email);
  };

  return (
    <Box className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <Box className="w-full max-w-md">
        <Box className="bg-white/[0.02] backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/[0.05]">
          <Box className="p-8 pt-36 relative">
            <Box className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-12">
              <Box className="bg-gradient-to-r from-purple-500 to-pink-600 p-5 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                <LockReset className="text-white text-4xl" />
              </Box>
            </Box>

            <Typography
              variant="h4"
              className="text-center mb-2 bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent font-bold"
            >
              Şifremi Unuttum
            </Typography>
            <Typography className="text-gray-400 text-center mb-8">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı
              gönderelim.
            </Typography>

            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                fullWidth
                label="E-posta"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="dark-input"
              />

              <Button
                type="submit"
                fullWidth
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 hover:scale-[1.02] shadow-xl"
              >
                Şifre Sıfırlama Bağlantısı Gönder
              </Button>

              <Box className="flex items-center justify-center pt-4">
                <Link
                  to="/"
                  className="py-3 px-8 rounded-xl border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 transition-all duration-300 text-sm text-center font-medium hover:scale-[1.02] min-w-[200px]"
                >
                  Giriş Sayfasına Dön
                </Link>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
