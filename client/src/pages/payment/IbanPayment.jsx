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
import {
  AccountBalance,
  Person,
  Numbers,
  CheckCircle,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const IbanPayment = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    iban: "",
    bankName: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedIban, setSavedIban] = useState(null);

  useEffect(() => {
    fetchIbanDetails();
  }, []);

  const fetchIbanDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/iban-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const ibanDetails = data.data?.ibanPayment || null;
          setFormData({
            fullName: "",
            iban: "",
            bankName: "",
          });
          setSavedIban(ibanDetails);
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
      const response = await fetch(`${API_URL}/api/users/update-iban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess("IBAN bilgileriniz başarıyla güncellendi");
        setSavedIban(formData);
        setFormData({ fullName: "", iban: "", bankName: "" }); // Clear form
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
      {/* Saved IBAN Table */}
      {savedIban && (
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
                  Ad Soyad
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  IBAN
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  Banka
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
                  sx={{
                    color: "white",
                    borderBottom: "none",
                  }}
                >
                  {savedIban.fullName}
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    borderBottom: "none",
                  }}
                >
                  {savedIban.iban}
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    borderBottom: "none",
                  }}
                >
                  {savedIban.bankName}
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

      {/* Form for new IBAN */}
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
          {savedIban ? "IBAN Bilgilerini Güncelle" : "IBAN ile Ödeme Bilgileri"}
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
              <Person sx={{ color: "#3b82f6" }} />
              <Typography sx={{ color: "white" }}>Ad Soyad</Typography>
            </Box>
            <TextField
              fullWidth
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ad ve soyadınızı girin"
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

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Numbers sx={{ color: "#3b82f6" }} />
              <Typography sx={{ color: "white" }}>IBAN</Typography>
            </Box>
            <TextField
              fullWidth
              name="iban"
              value={formData.iban}
              onChange={handleChange}
              placeholder="IBAN numaranızı girin"
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
              <AccountBalance sx={{ color: "#3b82f6" }} />
              <Typography sx={{ color: "white" }}>Banka Adı</Typography>
            </Box>
            <TextField
              fullWidth
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Banka adını girin"
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
            ) : savedIban ? (
              "Bilgileri Güncelle"
            ) : (
              "Bilgileri Kaydet"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default IbanPayment;
