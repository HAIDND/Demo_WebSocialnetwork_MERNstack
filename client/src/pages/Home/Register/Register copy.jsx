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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      error: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, dateOfBirth, gender } =
      formData;

    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !dateOfBirth ||
      !gender
    ) {
      setFormData({ ...formData, error: "Vui lòng điền đầy đủ thông tin!" });
      return;
    }

    if (password !== confirmPassword) {
      setFormData({ ...formData, error: "Mật khẩu không khớp!" });
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18 || (age === 18 && today.getMonth() < birthDate.getMonth())) {
      setFormData({ ...formData, error: "Bạn phải trên 18 tuổi để đăng ký!" });
      return;
    }

    const response = await createUser(formData);

    if (response.error) {
      setFormData({ ...formData, error: response.error });
    } else {
      console.log("Đăng ký thành công!");
      setFormData({ ...formData, error: "", open: true });

      setTimeout(() => {
        navigate("/login");
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        component="form"
        method="POST"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          padding: 4,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
          marginTop: 5,
          marginBottom: 8,
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          Register
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Username"
              name="username"
              fullWidth
              required
              value={formData.username}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email address"
              name="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Phone number"
              name="phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {formData.error && (
          <Typography color="error" sx={{ textAlign: "center" }}>
            {formData.error}
          </Typography>
        )}

        <Button type="submit" fullWidth variant="contained" color="primary">
          Register
        </Button>
      </Box>

      <Dialog open={formData.open} disableEscapeKeyDown>
        <DialogTitle>Đăng ký thành công</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tài khoản của bạn đã được tạo thành công. Chuyển hướng đến trang
            đăng nhập...
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            component={Link}
            to="/login"
            color="primary"
            variant="contained"
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
