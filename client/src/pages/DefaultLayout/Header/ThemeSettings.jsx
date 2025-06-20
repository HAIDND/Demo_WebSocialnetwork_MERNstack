import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  Switch,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Chấm màu
const ColorDot = styled("span")(({ color }) => ({
  display: "inline-block",
  width: 16,
  height: 16,
  borderRadius: "50%",
  backgroundColor: color,
  marginRight: 8,
  border: "1px solid #ccc",
}));

const colorOptions = [
  { label: "Red", value: "#f44336", secondary: "#f3f3f3" },
  { label: "Green", value: "#4caf50", secondary: "#FFCC00" },
  { label: "Blue", value: "#2196f3", secondary: "#FFB347" },
  { label: "Purple", value: "#9c27b0", secondary: "#FFF1F1" },
  { label: "Teal", value: "#009688", secondary: "#FFD699" },
];

const ThemeSettings = ({
  themeColor,
  setThemeColor,
  darkMode,
  setDarkMode,
  themeSecondary,
  setThemeSecondary,
}) => {
  const [headerBackground, setHeaderBackground] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("themeColor", themeColor);
    sessionStorage.setItem("darkMode", darkMode);
    sessionStorage.setItem("themeSecondary", themeSecondary);
  }, [themeColor, themeSecondary, darkMode]);

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setThemeColor(newColor);

    const selected = colorOptions.find((c) => c.value === newColor);
    if (selected) {
      setThemeSecondary(selected.secondary);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        maxWidth: 400,
        borderRadius: 3,
        mx: "auto",
        bgcolor: headerBackground ? "primary.light" : "background.paper",
      }}
    >
      <Typography variant="h5" fontWeight={600} mb={2} color="primary">
        🎨 Theme Customization
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="body1" fontWeight={500} gutterBottom>
        Select Theme Color
      </Typography>

      <RadioGroup value={themeColor} onChange={handleColorChange}>
        <Stack spacing={1}>
          {colorOptions.map((color) => (
            <FormControlLabel
              key={color.value}
              value={color.value}
              control={<Radio />}
              label={
                <Box display="flex" alignItems="center">
                  <ColorDot color={color.value} />
                  {color.label}
                </Box>
              }
            />
          ))}
        </Stack>
      </RadioGroup>

      <Divider sx={{ my: 2 }} />

      <List dense>
        <ListItem
          sx={{ display: "flex", justifyContent: "space-between", px: 0 }}
        >
          <Typography variant="body2">Highlight Header</Typography>
          <Switch
            checked={headerBackground}
            onChange={() => setHeaderBackground(!headerBackground)}
          />
        </ListItem>

        <ListItem
          sx={{ display: "flex", justifyContent: "space-between", px: 0 }}
        >
          <Typography variant="body2">Dark Mode</Typography>
          <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </ListItem>
      </List>
    </Paper>
  );
};

export default ThemeSettings;
