import { Link } from "react-router-dom";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  useTheme,
} from "@mui/material";
import { Settings } from "@mui/icons-material";

function SettingsPage() {
  const theme = useTheme();

  const settingsOptions = [
    { title: "Edit Profile", link: "editprofile" },
    { title: "My Interest", link: "interest" },
    { title: "Delete Account", link: "deleteaccount" },
  ];

  return (
    <Grid container>
      {/* Sidebar Placeholder */}
      <Grid
        item
        flex={2}
        display={{ xs: "none", md: "block" }}
        sx={{ overflow: "auto" }}
      />

      {/* Main Content */}
      <Grid
        item
        flex={5}
        sx={{
          mt: 10,
          mr: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            maxWidth: 600,
            width: "100%",
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            align="center"
            sx={{ color: theme.palette.primary.main, mb: 4, mt: 4 }}
          >
            <Settings fontSize="large"></Settings>
            Settings
          </Typography>

          {/* Cột các lựa chọn */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {settingsOptions.map((option, index) => (
              <Card
                key={index}
                sx={{
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardActionArea component={Link} to={option.link}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ color: "#333" }}
                    >
                      {option.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default SettingsPage;
