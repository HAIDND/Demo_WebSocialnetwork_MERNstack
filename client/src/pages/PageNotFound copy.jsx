import React from "react";
import { Box, Typography, Grid } from "@mui/material";

const PageNotFound = () => {
  return (
    <Grid container>
      <Grid
        item
        flex={2}
        sx={{ overflow: "auto" }}
        display={{ xs: "none", md: "block" }}
      ></Grid>
      <Grid item flex={10} sx={{ mt: 12, height: "100%", overflow: "auto" }}>
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage:
              "url(https://tse2.mm.bing.net/th?id=OIP.MW7jXFK6eiqVjpAMZFkFEAHaEK&pid=Api&P=0&h=180)", // Thay đổi đường dẫn ảnh
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "black",
            textAlign: "center",
          }}
        >
          <Typography variant="h1" component="h1" gutterBottom>
            404
          </Typography>
          <Typography variant="h4" component="h2">
            Page Not Found
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PageNotFound;
