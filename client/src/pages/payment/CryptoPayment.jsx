import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { AccountBalanceWallet, Key, CheckCircle } from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CryptoPayment = () => {
  const [formData, setFormData] = useState({
    trxAddress: "",
    mnemonicKey: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedAddress, setSavedAddress] = useState(null);

  useEffect(() => {
    fetchCryptoDetails();
  }, []);

  const fetchCryptoDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/crypto-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const trxAddress = data.data?.cryptoPayment?.trxAddress || "";
          setFormData({
            trxAddress: "",
            mnemonicKey: "",
          });
          setSavedAddress(trxAddress || null);
        } else {
          setError(data.message || "Bilgiler yüklenirken bir hata oluştu");
        }
      } else {
        throw new Error("Bilgiler yüklenirken bir hata oluştu");
      }
      setLoading(false);
    } catch (err) {
      setError("Bilgiler yüklenirken bir hata oluştu");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/update-crypto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess("Kripto ödeme bilgileriniz başarıyla güncellendi");
        setSavedAddress(formData.trxAddress);
        setFormData({ trxAddress: "", mnemonicKey: "" }); // Clear form
      } else {
        setError(data.message || "Bilgiler kaydedilirken bir hata oluştu");
      }
    } catch (err) {
      setError("Bilgiler kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", py: 4 }}>
      {/* Saved Address Table */}
      {savedAddress && (
        <TableContainer
          component={Paper}
          sx={{
            mb: 4,
            background: "rgba(30, 41, 59, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            backdropFilter: "blur(20px)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  Kayıtlı TRX Adresi
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  Durum
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    color: "white",
                    borderBottom: "none",
                  }}
                >
                  {savedAddress}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    borderBottom: "none",
                  }}
                >
                  <Chip
                    icon={<CheckCircle />}
                    label="Aktif"
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Form for new address */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          background: "rgba(30, 41, 59, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          backdropFilter: "blur(20px)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "white",
            fontWeight: 600,
            mb: 3,
          }}
        >
          {savedAddress
            ? "TRX Adresini Güncelle"
            : "Tether TRX Ödeme Bilgileri"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AccountBalanceWallet sx={{ color: "#3b82f6" }} />
              <Typography sx={{ color: "white" }}>TRX Adresi</Typography>
            </Box>
            <TextField
              fullWidth
              name="trxAddress"
              value={formData.trxAddress}
              onChange={handleChange}
              placeholder="TRX adresinizi girin"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Key sx={{ color: "#3b82f6" }} />
              <Typography sx={{ color: "white" }}>Mnemonic Key</Typography>
            </Box>
            <TextField
              fullWidth
              type="password"
              name="mnemonicKey"
              value={formData.mnemonicKey}
              onChange={handleChange}
              placeholder="Mnemonic key'inizi girin"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              py: 1.5,
              px: 4,
              bgcolor: "#3b82f6",
              "&:hover": {
                bgcolor: "#2563eb",
              },
            }}
          >
            {saving ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : savedAddress ? (
              "Adresi Güncelle"
            ) : (
              "Bilgileri Kaydet"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CryptoPayment;
