import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  VerifiedUser,
  Email,
  CalendarToday,
  AccountBalanceWallet,
  LocalShipping,
  Payment,
  Timeline,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Logs = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }

      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Veriler getirilemedi");
      }

      const data = await response.json();
      if (data.success) {
        const approvedUsers = data.data.users
          .filter(
            (user) => user.isVerified && user.verificationStatus === "approved"
          )
          .sort((a, b) => (b.earnings || 0) - (a.earnings || 0));

        setUsers(approvedUsers);
        setError("");
      } else {
        throw new Error(data.message || "Veriler getirilemedi");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(
        "Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000); // Changed to 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate totals for the current page
  const currentUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const pageTotals = currentUsers.reduce(
    (acc, user) => ({
      earnings: acc.earnings + (user.earnings || 0),
      withdrawals: acc.withdrawals + (user.withdrawals || 0),
      deliveries: acc.deliveries + (user.deliveryCount || 0),
      pendingPayments:
        acc.pendingPayments + ((user.earnings || 0) - (user.withdrawals || 0)),
    }),
    { earnings: 0, withdrawals: 0, deliveries: 0, pendingPayments: 0 }
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: "rgba(30, 41, 59, 0.5)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Timeline sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Onaylı Kullanıcı Kayıtları
          </Typography>
          <Box sx={{ ml: "auto", display: "flex", gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Toplam Kullanıcı: {users.length}
            </Typography>
            <Typography variant="body2" color="success.main">
              Toplam Kazanç:{" "}
              {pageTotals.earnings.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              ₺
            </Typography>
            <Typography variant="body2" color="warning.main">
              Bekleyen Ödemeler:{" "}
              {pageTotals.pendingPayments.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              ₺
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VerifiedUser fontSize="small" />
                    Kullanıcı Bilgileri
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccountBalanceWallet fontSize="small" />
                    Finansal Durum
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalShipping fontSize="small" />
                    Teslimat Bilgileri
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    Tarih Bilgileri
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow
                  key={user._id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body1">{user.username}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Email
                          fontSize="small"
                          sx={{ mr: 0.5, fontSize: 14 }}
                        />
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        alignItems: "flex-end",
                      }}
                    >
                      <Typography variant="body2" color="success.main">
                        Kazanç:{" "}
                        {user.earnings?.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ₺
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        Çekim:{" "}
                        {user.withdrawals?.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ₺
                      </Typography>
                      <Typography variant="caption" color="info.main">
                        Bekleyen:{" "}
                        {(
                          (user.earnings || 0) - (user.withdrawals || 0)
                        ).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        ₺
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        alignItems: "flex-end",
                      }}
                    >
                      <Typography variant="body2">
                        <LocalShipping
                          sx={{ fontSize: 16, color: "primary.main", mr: 0.5 }}
                        />
                        {user.deliveryCount || 0} Teslimat
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ortalama:{" "}
                        {user.deliveryCount && user.earnings
                          ? (user.earnings / user.deliveryCount).toLocaleString(
                              "tr-TR",
                              { minimumFractionDigits: 2 }
                            )
                          : "0.00"}{" "}
                        ₺/Teslimat
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        alignItems: "flex-end",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Son Giriş:{" "}
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString("tr-TR")
                          : "-"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Kayıt:{" "}
                        {new Date(user.createdAt).toLocaleString("tr-TR")}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={users.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </Paper>
    </Box>
  );
};

export default Logs;
