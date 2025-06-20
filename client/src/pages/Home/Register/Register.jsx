import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Grid,
  Container,
  Typography,
  CssBaseline,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Paper,
  Fade,
  Slide,
  Alert,
} from "@mui/material";
import { createUser } from "~/services/userServices/userService";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    error: "",
    open: false,
  });

  const navigate = useNavigate();

  // Validation helpers
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return !phone || phoneRegex.test(phone);
  };

  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const validateForm = () => {
    const {
      username,
      email,
      password,
      confirmPassword,
      dateOfBirth,
      gender,
      phone,
    } = formData;

    if (!username.trim()) {
      return "Vui lòng nhập tên người dùng!";
    }

    if (username.length < 3) {
      return "Tên người dùng phải có ít nhất 3 ký tự!";
    }

    if (!email.trim()) {
      return "Vui lòng nhập email!";
    }

    if (!validateEmail(email)) {
      return "Email không hợp lệ!";
    }

    if (!password) {
      return "Vui lòng nhập mật khẩu!";
    }

    if (!validatePassword(password)) {
      return "Mật khẩu phải có ít nhất 8 ký tự!";
    }

    if (!confirmPassword) {
      return "Vui lòng xác nhận mật khẩu!";
    }

    if (password !== confirmPassword) {
      return "Mật khẩu không khớp!";
    }

    if (phone && !validatePhone(phone)) {
      return "Số điện thoại không hợp lệ!";
    }

    if (!dateOfBirth) {
      return "Vui lòng nhập ngày sinh!";
    }

    if (calculateAge(dateOfBirth) < 18) {
      return "Bạn phải trên 18 tuổi để đăng ký!";
    }

    if (!gender) {
      return "Vui lòng chọn giới tính!";
    }

    return null;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      error: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setFormData({ ...formData, error: validationError });
      return;
    }

    try {
      const response = await createUser(formData);

      if (response.error) {
        setFormData({ ...formData, error: response.error });
      } else {
        console.log("Đăng ký thành công!");
        setFormData({ ...formData, error: "", open: true });

        setTimeout(() => {
          navigate("/login");
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setFormData({
        ...formData,
        error: "Có lỗi xảy ra. Vui lòng thử lại!",
      });
    }
  };

  const handleCloseDialog = () => {
    setFormData({ ...formData, open: false });
    navigate("/login");
    window.location.reload();
  };

  return (
    <Box component="main" sx={{ minWidth: "100%" }}>
      <CssBaseline />
      <Box
        sx={{
          // width: "100vw",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 4,
        }}
      >
        <Fade in timeout={800}>
          <Paper
            elevation={24}
            sx={{
              width: "100%",
              maxWidth: 500,
              background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 6,
                background:
                  "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              },
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 4,
                pt: 5,
              }}
            >
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  textAlign: "center",
                  mb: 4,
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                Register
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Tên người dùng"
                    name="username"
                    fullWidth
                    required
                    value={formData.username}
                    onChange={handleChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.25)",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Địa chỉ email"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    value={formData.email}
                    onChange={handleChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.25)",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    fullWidth
                    required
                    value={formData.password}
                    onChange={handleChange}
                    helperText="Tối thiểu 8 ký tự"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.25)",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    type="password"
                    fullWidth
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.25)",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Số điện thoại"
                    name="phone"
                    fullWidth
                    value={formData.phone}
                    onChange={handleChange}
                    helperText="Tùy chọn"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.25)",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ngày sinh"
                    name="dateOfBirth"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.25)",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                        },
                        "&.Mui-focused": {
                          boxShadow: "0 6px 20px rgba(102, 126, 234, 0.25)",
                        },
                      },
                    }}
                  >
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      label="Giới tính"
                    >
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                      <MenuItem value="other">Khác</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {formData.error && (
                <Fade in>
                  <Alert
                    severity="error"
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(244, 67, 54, 0.15)",
                    }}
                  >
                    {formData.error}
                  </Alert>
                </Fade>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  background:
                    "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.6)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                Register
              </Button>

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: "#667eea",
                      textDecoration: "none",
                      fontWeight: 600,
                      transition: "color 0.3s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#764ba2")}
                    onMouseOut={(e) => (e.target.style.color = "#667eea")}
                  >
                    Đăng nhập ngay
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Box>

      <Dialog
        open={formData.open}
        disableEscapeKeyDown
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            background: "linear-gradient(45deg, #667eea, #764ba2)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            fontSize: "1.5rem",
          }}
        >
          🎉 Đăng ký thành công!
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <DialogContentText sx={{ fontSize: "1.1rem", color: "text.primary" }}>
            Tài khoản của bạn đã được tạo thành công.
            <br />
            Đang chuyển hướng đến trang đăng nhập...
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
              boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
                boxShadow: "0 8px 25px rgba(102, 126, 234, 0.6)",
              },
            }}
          >
            Đăng nhập ngay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
