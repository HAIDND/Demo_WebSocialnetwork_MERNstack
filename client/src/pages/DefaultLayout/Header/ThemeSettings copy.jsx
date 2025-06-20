import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Box, Typography, RadioGroup, FormControlLabel, Radio, List, ListItem, Switch } from "@mui/material";

const ThemeSettings = ({ themeColor, setThemeColor, darkMode, setDarkMode, themeSecondary, setThemeSecondary }) => {
    // const [themeColor, setThemeColor] = useState("#2196f3"); // Màu mặc định
    const [headerBackground, setHeaderBackground] = useState(false);
    const [menuPosition, setMenuPosition] = useState(false);
    // const [darkMode, setDarkMode] = useState(false);

    // Cập nhật localStorage khi theme thay đổi
    useEffect(() => {
        sessionStorage.setItem("themeColor", themeColor);
        sessionStorage.setItem("darkMode", darkMode);
        sessionStorage.setItem("themeSecondary", themeSecondary);
    }, [themeColor, themeSecondary, darkMode]);
    // Tạo theme tùy chỉnh

    const handleColorChange = (event) => {
        setThemeColor(event.target.value);
        switch (event.target.value) {
            case "#f44336": //red
                setThemeSecondary("#f3f3f3");
                break;
            case "#4caf50": // green
                setThemeSecondary("#FFCC00");
                break;
            case "#2196f3":
                setThemeSecondary("#FFB347"); // blue
                break;
            case "#ffeb3b": //yellow
                setThemeSecondary("#000000");
                break;
            default:
                break;
        }
    };

    return (
        <Box sx={{ p: 2, backgroundColor: headerBackground ? "primary.main" : "inherit", color: "text.primary" }}>
            <Typography variant="h6" color="primary">
                Theme Customization
            </Typography>

            <Typography variant="body2">Choose Color Theme</Typography>
            <RadioGroup value={themeColor} onChange={handleColorChange}>
                <FormControlLabel value="#f44336" control={<Radio />} label="Red" />
                <FormControlLabel value="#4caf50" control={<Radio />} label="Green" />
                <FormControlLabel value="#2196f3" control={<Radio />} label="Blue" />
                <FormControlLabel value="#ffeb3b" control={<Radio />} label="Yellow" />
            </RadioGroup>

            <List>
                <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Hight light </Typography>
                    <Switch checked={headerBackground} onChange={() => setHeaderBackground(!headerBackground)} />
                </ListItem>
                {/* 
                <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Menu Position</Typography>
                    <Switch checked={menuPosition} onChange={() => setMenuPosition(!menuPosition)} />
                </ListItem> */}

                <ListItem sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">Dark Mode</Typography>
                    <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                </ListItem>
            </List>
        </Box>
    );
};

export default ThemeSettings;
