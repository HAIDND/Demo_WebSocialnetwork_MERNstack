import React from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import { keyframes } from "@emotion/react";
import { Link } from "react-router-dom";

// Hiệu ứng xuất hiện từ dưới lên
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageNotFound = () => {
  return (
    <Grid container>
      {/* Sidebar trái (placeholder) */}
      <Grid
        item
        flex={2}
        sx={{ overflow: "auto" }}
        display={{ xs: "none", md: "block" }}
      />

      {/* Nội dung chính */}
      <Grid item flex={10} sx={{ mt: 0, height: "100vh", overflow: "auto" }}>
        <Box
          sx={{
            height: "100%",
            position: "relative",

            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay mờ */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              px: 3,
              color: "#fff",
              animation: `${fadeInUp} 1s ease`,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "5rem", md: "8rem" },
                mb: 2,
                textShadow: "2px 2px 10px rgba(0,0,0,0.7)",
              }}
            >
              404
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                fontWeight: 500,
                textShadow: "1px 1px 6px rgba(0,0,0,0.6)",
              }}
            >
              Oops! Page Not Found
            </Typography>

            <Button
              component={Link}
              to="/home"
              variant="contained"
              color="primary"
              sx={{ px: 4, py: 1.5, fontSize: "1rem", borderRadius: "30px" }}
            >
              Go Back Home
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PageNotFound;
