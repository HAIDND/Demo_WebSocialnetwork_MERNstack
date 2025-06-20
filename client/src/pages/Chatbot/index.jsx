import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  Button,
  Fade,
  Slide,
  Stack,
} from "@mui/material";
import { Close, Comment } from "@mui/icons-material";
import { API_BASE_URL } from "~/config/apiConfig";

const apiUrl = `${API_BASE_URL}chatbot`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "model",
      text: "Chào bạn, tôi là trợ lý Viesocial về du lịch của bạn. Bạn có câu hỏi gì về du lịch không?",
    },
  ]);
  const inputRef = useRef(null);
  const chatBodyRef = useRef(null);

  const tourismKeywords = [
    "mạng xã hội",
    "khách sạn",
    "tour du lịch",
    "ẩm thực",
    "visa",
    "vé máy bay",
    "du lịch",
    "lữ hành",
    "tại sao",
    "du lich",
    "đi",
    "địa điểm",
    "cẩm nang du lịch",
    "hành trình",
    "phượt",
    "review du lịch",
    "kinh nghiệm du lịch",
    "thủ tục",
    "check-in",
    "sống ảo",
    "đặt phòng",
    "chụp ảnh",
    "du lịch bụi",
    "bản đồ du lịch",
    "homestay",
    "resort",
    "camping",
    "dã ngoại",
    "du lịch nghỉ dưỡng",
    "du lịch khám phá",
    "du lịch sinh thái",
    "vườn quốc gia",
    "bãi biển",
    "núi",
    "hang động",
    "thác nước",
    "chùa chiền",
    "di tích lịch sử",
    "địa danh",
    "khám phá",
    "ẩm thực địa phương",
    "món ngon",
    "lễ hội",
    "văn hóa",
    "bản sắc",
    "trải nghiệm",
    "hướng dẫn viên",
    "du lịch tự túc",
    "lịch trình",
    "combo du lịch",
    "săn vé rẻ",
    "tour trọn gói",
    "du lịch quốc tế",
    "du lịch nội địa",
    "hộ chiếu",
    "đi nước ngoài",
    "thị thực",
    "quán cà phê đẹp",
    "địa điểm ăn uống",
    "thuê xe máy",
    "thuê xe du lịch",
    "check list",
    "gợi ý lịch trình",
    "du lịch cuối tuần",
    "chuyến đi",
    "nơi ở",
    "view đẹp",
    "địa điểm du lịch",
    "review địa điểm",
    "đi chơi",
    "chỗ ở",
    "địa điểm vui chơi",
    "tour nước ngoài",
    "du lịch trải nghiệm",
    "book phòng",
    "ăn gì ở",
    "đi đâu chơi",
    "mùa du lịch",
    "du lịch 4 phương",
    "du lịch miền núi",
    "du lịch biển đảo",
    "đi phượt",
    "balo du lịch",
    "đặt tour",
    "xe khách",
    "máy bay",
    "tàu hỏa",
    "thuê hướng dẫn viên",
    "khu du lịch",
    "cảnh đẹp",
    "cảnh quan",
    "địa điểm sống ảo",
    "săn mây",
    "leo núi",
    "du lịch mạo hiểm",
    "trải nghiệm văn hóa",
    "ẩm thực đường phố",
    "món ăn đặc sản",
    "review món ăn",
    "nhà nghỉ",
    "trải nghiệm homestay",
    "du lịch sinh thái",
    "du lịch cộng đồng",
    "check in sống ảo",
    "travel blogger",
    "travel vlog",
    "đi đâu đó",
    "trải nghiệm địa phương",
    "khám phá thế giới",
    "chi phí",
  ];

  const isTourismRelated = (question) => {
    const lowercaseQuestion = question.toLowerCase();
    return tourismKeywords.some((keyword) =>
      lowercaseQuestion.includes(keyword)
    );
  };

  const updateHistory = (text) => {
    setChatHistory((prev) => [
      ...prev.filter((msg) => msg.text !== "Thinking..."),
      { role: "model", text },
    ]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";
    setChatHistory((prev) => [...prev, { role: "user", text: userMessage }]);
    if (!isTourismRelated(userMessage)) {
      updateHistory(
        "Xin lỗi, tôi chỉ có thể trả lời các câu hỏi liên quan đến du lịch."
      );
      return;
    }
    setChatHistory((prev) => [...prev, { role: "model", text: "Thinking..." }]);
    generateResponse([...chatHistory, { role: "user", text: userMessage }]);
  };

  const generateResponse = async (history) => {
    try {
      history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: history }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Error");
      updateHistory(data.data);
    } catch (err) {
      updateHistory("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter" && isOpen) handleFormSubmit(e);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, chatHistory]);

  return (
    <>
      <Fade in={!isOpen} timeout={500}>
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            width: 70,
            height: 60,
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          <Comment />
        </IconButton>
      </Fade>

      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            width: 360,
            height: 500,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "white",
              position: "relative",
            }}
          >
            <Typography variant="h6">Trợ lý Du lịch</Typography>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ position: "absolute", right: 8, top: 8, color: "white" }}
            >
              <Close />
            </IconButton>
          </Box>

          <Box
            ref={chatBodyRef}
            sx={{ flexGrow: 1, p: 2, overflowY: "auto", bgcolor: "#f4f4f4" }}
          >
            <Stack spacing={1}>
              {chatHistory.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    bgcolor: msg.role === "user" ? "primary.light" : "grey.200",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "80%",
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            component="form"
            onSubmit={handleFormSubmit}
            sx={{ display: "flex", p: 1, borderTop: "1px solid #ccc" }}
          >
            <TextField
              fullWidth
              inputRef={inputRef}
              placeholder="Nhập câu hỏi về du lịch..."
              size="small"
              variant="outlined"
            />
            <Button type="submit" variant="contained" sx={{ ml: 1 }}>
              Gửi
            </Button>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default Chatbot;
