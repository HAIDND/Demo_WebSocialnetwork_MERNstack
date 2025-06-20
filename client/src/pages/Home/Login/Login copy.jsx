import {
  TextField,
  Box,
  Typography,
  Button,
  FormHelperText,
} from "@mui/material";
import { useState, useContext, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { login } from "~/services/authService/authService";
import auth from "~/services/authService/authHelper";
import { CurrentUser } from "../../../context/GlobalContext";
import { readUser } from "../../../services/userServices/userService";
// import socket from "~/context/socket";
import { SocketContext } from "~/context/SocketContext";
import { GoogleRegister } from "~/components/Elements/GoogleRegister";

export default function Login() {
  const { LoginSocket } = useContext(SocketContext);
  const { currentUserInfo, currentUser, setCurrentUser, setCurrentUserInfo } =
    useContext(CurrentUser);
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
    error: "",
    redirectToReferrer: false,
  });

  function hanldeAuthInfo(data) {
    readUser(data.userId).then((info) => {
      if (info) {
        LoginSocket(info.email);
        setCurrentUserInfo(info);
      } else {
        console.log("No profile");
      }
    });
    auth.authenticate(data, () => {
      setValues((prev) => ({
        ...prev,
        error: "",
        redirectToReferrer: true,
      }));
    });
  }
  const clickSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn reload nếu dùng <form>

    const user = {
      email: values.email || undefined,
      password: values.password || undefined,
    };

    login(user)
      .then((data) => {
        if (!data) throw new Error("Error from server.");
        if (data.message) {
          setValues((prev) => ({ ...prev, error: data.message }));
        } else {
          setCurrentUser(data);
          //read user data
          readUser(data.userId).then((sss) => {
            if (sss) {
              LoginSocket(sss.email);
              setCurrentUserInfo(sss);
            } else {
              console.log("No profile");
            }
          });
          auth.authenticate(data, () => {
            setValues((prev) => ({
              ...prev,
              error: "",
              redirectToReferrer: true,
            }));
          });
        }
      })
      .catch((err) => setValues((prev) => ({ ...prev, error: err.message })));
  };
  if (values.redirectToReferrer) {
    return <Navigate to="/home" />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 2,
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "#1877f2",
            fontWeight: "bold",
            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            mb: 1,
          }}
        >
          Social
        </Typography>
        <Typography variant="body1" sx={{ color: "#606770", fontSize: 18 }}>
          helps you connect and share with people around the world
        </Typography>
      </Box>
      <Box
        component="form"
        onSubmit={clickSubmit}
        sx={{
          width: 400,
          padding: 4,
          borderRadius: 2,
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          backgroundColor: "#ffffff",
        }}
      >
        <TextField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={(e) =>
            setValues({ ...values, email: e.target.value, error: "" })
          }
          required
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={(e) =>
            setValues({ ...values, password: e.target.value, error: "" })
          }
          required
          fullWidth
          sx={{ mb: 2 }}
        />
        {values.error && (
          <FormHelperText error sx={{ textAlign: "center", mb: 2 }}>
            {values.error}
          </FormHelperText>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            backgroundColor: "#1877f2",
            textTransform: "none",
            fontSize: 18,
            fontWeight: "bold",
            ":hover": { backgroundColor: "#166fe5" },
          }}
        >
          Login
        </Button>
        <Box>
          <GoogleRegister hanldeAuthInfo={hanldeAuthInfo} />
        </Box>
      </Box>
    </Box>
  );
}
