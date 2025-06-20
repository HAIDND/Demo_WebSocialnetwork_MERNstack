import React, { useState, useContext, useCallback } from "react";
import {
  TextField,
  Box,
  Typography,
  Button,
  FormHelperText,
  InputAdornment,
  IconButton,
  Paper,
  Fade,
  Slide,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useNavigate, Navigate } from "react-router-dom";
import { login } from "~/services/authService/authService";
import auth from "~/services/authService/authHelper";
import { CurrentUser } from "../../../context/GlobalContext";
import { readUser } from "../../../services/userServices/userService";
import { SocketContext } from "~/context/SocketContext";
import { GoogleRegister } from "~/components/Elements/GoogleRegister";

// === VALIDATION UTILITIES ===
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email?.trim() || "");
};

const validatePassword = (password) => {
  return password && password.trim().length >= 6;
};

const getValidationErrors = (email, password) => {
  const errors = {};

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password?.trim()) {
    errors.password = "Password is required";
  } else if (!validatePassword(password)) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
};

// === MAIN COMPONENT ===
export default function Login() {
  // Context hooks
  const { LoginSocket } = useContext(SocketContext);
  const { setCurrentUser, setCurrentUserInfo } = useContext(CurrentUser);
  const navigate = useNavigate();

  // State management
  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    redirectToReferrer: false,
    showPassword: false,
    isLoading: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  // Mount effect for animations
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // === AUTHENTICATION HANDLERS ===

  // Handle user authentication and profile loading
  const handleUserAuthentication = useCallback(
    async (userData) => {
      try {
        const userInfo = await readUser(userData.userId);
        if (userInfo) {
          LoginSocket(userInfo.email);
          setCurrentUserInfo(userInfo);
        } else {
          console.log("No profile");
        }

        auth.authenticate(userData, () => {
          setValues((prev) => ({
            ...prev,
            error: "",
            redirectToReferrer: true,
            isLoading: false,
          }));
        });
      } catch (error) {
        console.error("Error during authentication:", error);
        setValues((prev) => ({
          ...prev,
          error: "Authentication failed",
          isLoading: false,
        }));
      }
    },
    [LoginSocket, setCurrentUserInfo]
  );

  // Handle auth info for Google login (maintains original function name)
  const hanldeAuthInfo = useCallback(
    (data) => {
      handleUserAuthentication(data);
    },
    [handleUserAuthentication]
  );

  // === INPUT HANDLERS ===

  // Handle input changes with real-time validation
  const handleInputChange = useCallback(
    (field) => (event) => {
      const value = event.target.value;

      setValues((prev) => ({
        ...prev,
        [field]: value,
        error: "", // Clear general error when user types
      }));

      // Clear field-specific error when user starts typing
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    },
    [fieldErrors]
  );

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  }, []);

  // === FORM VALIDATION ===

  // Validate form and return validation status
  const validateForm = useCallback(() => {
    const errors = getValidationErrors(values.email, values.password);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [values.email, values.password]);

  // === FORM SUBMISSION ===

  // Handle form submission (maintains original logic)
  const clickSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (values.isLoading) return;

      // Validate form before submission
      if (!validateForm()) {
        return;
      }

      setValues((prev) => ({ ...prev, isLoading: true, error: "" }));

      const user = {
        email: values.email?.trim() || undefined,
        password: values.password?.trim() || undefined,
      };

      try {
        const data = await login(user);

        if (!data) {
          throw new Error("Error from server.");
        }

        if (data.message) {
          setValues((prev) => ({
            ...prev,
            error: data.message,
            isLoading: false,
          }));
        } else {
          setCurrentUser(data);
          // Read user data and authenticate
          const userInfo = await readUser(data.userId);
          if (userInfo) {
            LoginSocket(userInfo.email);
            setCurrentUserInfo(userInfo);
          } else {
            console.log("No profile");
          }

          auth.authenticate(data, () => {
            setValues((prev) => ({
              ...prev,
              error: "",
              redirectToReferrer: true,
              isLoading: false,
            }));
          });
        }
      } catch (err) {
        setValues((prev) => ({
          ...prev,
          error: err.message || "Login failed",
          isLoading: false,
        }));
      }
    },
    [
      values.email,
      values.password,
      values.isLoading,
      validateForm,
      setCurrentUser,
      LoginSocket,
      setCurrentUserInfo,
    ]
  );

  // === RENDER LOGIC ===

  // Redirect if authentication successful
  if (values.redirectToReferrer) {
    return <Navigate to="/home" />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      {/* Header Section */}
      <Fade in={mounted} timeout={1000}>
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
            color: "white",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              fontFamily: "Roboto, Helvetica, Arial, sans-serif",
              mb: 1,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              background: "linear-gradient(45deg, #fff, #e3f2fd)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Social
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: 18,
              opacity: 0.9,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            helps you connect and share with people around the world
          </Typography>
        </Box>
      </Fade>

      {/* Login Form */}
      <Slide direction="up" in={mounted} timeout={800}>
        <Paper
          elevation={24}
          sx={{
            width: { xs: "100%", sm: 400 },
            maxWidth: 400,
            borderRadius: 3,
            overflow: "hidden",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Box
            component="form"
            onSubmit={clickSubmit}
            sx={{
              padding: 4,
            }}
          >
            {/* Email Field */}
            <TextField
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleInputChange("email")}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              required
              fullWidth
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-focused": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(24, 119, 242, 0.15)",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              label="Password"
              name="password"
              type={values.showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleInputChange("password")}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              required
              fullWidth
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-focused": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(24, 119, 242, 0.15)",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {values.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Error Message */}
            {values.error && (
              <Fade in={!!values.error}>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {values.error}
                </Alert>
              </Fade>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={values.isLoading}
              sx={{
                height: 56,
                background: "linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)",
                fontSize: 18,
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2,
                mb: 3,
                transition: "all 0.3s ease",
                "&:hover:not(:disabled)": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(24, 119, 242, 0.4)",
                },
                "&:disabled": {
                  background: "linear-gradient(135deg, #ccc 0%, #999 100%)",
                },
              }}
            >
              {values.isLoading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            {/* Google Register Component */}
            <Box
              sx={{
                "& > *": {
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                },
              }}
            >
              <GoogleRegister hanldeAuthInfo={hanldeAuthInfo} />
            </Box>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}
