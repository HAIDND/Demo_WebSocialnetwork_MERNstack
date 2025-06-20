import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import { Close, Comment } from "@mui/icons-material";
import { API_BASE_URL } from "~/config/apiConfig";

const apiUrl = `${API_BASE_URL}chatbot`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const chatBodyRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "model",
      text: "Chào bạn, tôi là trợ lý media social về du lịch của bạn. Bạn có câu hỏi gì về du lịch không?",
    },
  ]);

  // const tourismKeywords = [
  //   "mạng xã hội",
  //   "khách sạn",
  //   "tour du lịch",
  //   "ẩm thực",
  //   "visa",
  //   "vé máy bay",
  //   "du lịch",
  //   "lữ hành",
  //   "tại sao",
  //   "du lich",
  //   "đi",
  //   "địa điểm"
  // ]; // Thêm các từ khóa liên quan đến du lịch
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
    setChatHistory([...chatHistory, { role: "user", text: userMessage }]);
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
      history = history.map(({ role, text }) => ({
        role,
        parts: [{ text }],
      }));
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents: history }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error.message || "An error occurred");
      console.log("data", data);
      const apiResponseText = data.data;
      updateHistory(apiResponseText);
    } catch (error) {
      console.error("Error generating response:", error);
    }
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    <>
      <div className="chatbot-icon" onClick={() => setIsOpen(true)}>
        <Comment />
      </div>
      <div className="wrapper" style={{ display: isOpen ? "block" : "none" }}>
        <div className="title">Trợ lý Du lịch</div>
        <Close
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            cursor: "pointer",
            color: "white",
          }}
          onClick={() => setIsOpen(false)}
        />
        <div className="box" ref={chatBodyRef}>
          {chatHistory.map((message, index) => (
            <div
              className={`item ${message.role === "user" ? "right" : ""}`}
              key={index}
            >
              {message.role !== "user" && (
                <div className="icon">
                  <i className="fa fa-user" />
                </div>
              )}
              <div className="msg">
                <div>
                  {message.text.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="typing-area">
          <div className="input-field">
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập câu hỏi của bạn"
              required
            />
            <button onClick={handleFormSubmit}>Gửi</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
