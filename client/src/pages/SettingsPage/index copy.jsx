// import { Link } from "react-router-dom";
// import { Grid, Box, Typography, List, ListItem, ListItemText } from "@mui/material";

// import Sidebar from "~/components/Layouts/Sidebar";
// function SettingsPage() {
//     return (
//         <>
//             <Grid container>
//                 <Grid item flex={2} sx={{ overflow: "auto" }} display={{ xs: "none", md: "block" }}>
//                     <Sidebar />
//                 </Grid>
//                 <Grid
//                     item
//                     flex={5}
//                     sx={{ mt: 12, height: "100%", overflow: "auto", borderLeft: "1px solid lightgrey" }}
//                 >
//                     <Box sx={{ padding: 3, maxWidth: 360 }}>
//                         <Box mb={4}>
//                             <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: "1.25rem", lg: "2rem" } }}>
//                                 Settings
//                             </Typography>
//                         </Box>

//                         {/* General Section */}
//                         <Box mb={4}>
//                             <Typography variant="caption" sx={{ fontWeight: 600, color: "grey.500", mb: 1 }}>
//                                 General
//                             </Typography>
//                             <List>
//                                 <ListItem disablePadding>
//                                     <ListItemText
//                                         primary={
//                                             <Link to="account-information.html" underline="hover">
//                                                 Account Information
//                                             </Link>
//                                         }
//                                     />
//                                 </ListItem>
//                             </List>
//                         </Box>

//                         {/* Account Section */}
//                         <Box mb={4}>
//                             <Typography variant="caption" sx={{ fontWeight: 600, color: "grey.500", mb: 1 }}>
//                                 Account
//                             </Typography>
//                             <List>
//                                 <ListItem disablePadding>
//                                     <Link to="editprofile" underline="hover">
//                                         Profile
//                                     </Link>
//                                 </ListItem>
//                                 <ListItem disablePadding>
//                                     <ListItemText
//                                         primary={
//                                             <Link to="account-information.html" underline="hover">
//                                                 Account Password
//                                             </Link>
//                                         }
//                                     />
//                                 </ListItem>
//                             </List>
//                         </Box>

//                         {/* Other Section */}
//                         <Box mb={4}>
//                             <Typography variant="caption" sx={{ fontWeight: 600, color: "grey.500", mb: 1 }}>
//                                 Other
//                             </Typography>
//                             <List>
//                                 <ListItem disablePadding>
//                                     <ListItemText
//                                         primary={
//                                             <Link to="account-information.html" underline="hover">
//                                                 Help Information
//                                             </Link>
//                                         }
//                                     />
//                                 </ListItem>
//                                 <ListItem disablePadding>
//                                     <ListItemText
//                                         primary={
//                                             <Link to="account-information.html" underline="hover">
//                                                 Logout
//                                             </Link>
//                                         }
//                                     />
//                                 </ListItem>
//                             </List>
//                         </Box>
//                     </Box>
//                 </Grid>
//             </Grid>
//         </>
//     );
// }

// export default SettingsPage;
import { Link } from "react-router-dom";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";

function SettingsPage() {
  // Danh sách các tùy chọn cài đặt
  const settingsOptions = [
    // { title: "Account Information", link: "account-information.html" },
    { title: "Edit Profile", link: "editprofile" },
    { title: "My interest", link: "interest" },
    // { title: "Help Information", link: "help-information.html" },
    { title: "Delete Account", link: "deleteaccount" },
  ];

  return (
    <>
      <Grid container>
        {/* Sidebar */}
        <Grid
          item
          flex={2}
          sx={{ overflow: "auto" }}
          display={{ xs: "none", md: "block" }}
        ></Grid>

        {/* Nội dung chính */}
        <Grid
          item
          flex={5}
          sx={{
            mt: 12,
            mr: 12,
            height: "100%",
            overflow: "auto",
            // borderLeft: "1px solid lightgrey",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              padding: 3,
              maxWidth: 800,
              minWidth: 600,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box mb={4}>
              <Typography
                variant="h4"
                fontWeight="700"
                sx={{ fontSize: { xs: "1.25rem", lg: "2rem" } }}
              >
                Settings
              </Typography>
            </Box>

            {/* Danh sách Card các tùy chọn cài đặt */}
            <Grid container spacing={2} justifyContent="center">
              {settingsOptions.map((option, index) => (
                <Grid item xs={12} sm={12} key={index}>
                  <Card>
                    <CardActionArea component={Link} to={option.link}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="500">
                          {option.title}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default SettingsPage;
