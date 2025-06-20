const KnowledgeModel = require("../models/knowlegde");
const chatbotRepo = require("../repositories/chatgpt.repo");
const stringSimilarity = require("string-similarity");
const {
  removeVietnameseTones,
  generateFlexibleRegex,
} = require("../utils/util");

// Thời gian hết hạn là 3 ngày
const EXPIRE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 ngày tính bằng milliseconds

const chatbotController = {
  createResponse: async (req, res) => {
    try {
      let { contents } = req.body;
      // lấy câu hỏi
      const userMessage = removeVietnameseTones(
        contents[contents.length - 1].parts[0].text
      );
      console.log(userMessage);

      // tìm các câu hỏi tương tự trong hệ thống
      const regexPattern = generateFlexibleRegex(userMessage);
      const responseSys = await KnowledgeModel.find({
        question: { $regex: regexPattern, $options: "i" },
      });
      // console.log("responseSys", responseSys);

      // Kiểm tra và xóa các câu trả lời đã hết hạn
      const currentTime = new Date();
      const validResponses = [];

      for (const resp of responseSys) {
        const timeDiff = currentTime - resp.createdAt;
        if (timeDiff > EXPIRE_TIME) {
          // Xóa câu trả lời đã hết hạn
          await KnowledgeModel.findByIdAndDelete(resp._id);
          console.log(`Đã xóa câu trả lời hết hạn: ${resp._id}`);
        } else {
          // Giữ lại câu trả lời còn hiệu lực
          validResponses.push(resp);
        }
      }

      // loại bỏ các câu trả lời của hệ thống
      const newContents = contents.filter((item) => item.role !== "model");

      // nếu không còn câu trả lời hợp lệ nào thì đi thu thập và trả về cho client
      if (validResponses.length <= 0) {
        const response = await saveByResponseAI(
          contents,
          newContents,
          userMessage
        );

        return res.status(200).json({
          data: response,
        });
      }

      // nếu có câu trả lời hợp lệ thì tiến hành kiểm tra xem đâu là câu trả lời đúng nhất
      if (validResponses.length > 0) {
        console.log("Processing valid responses");

        let count = 0;
        validResponses.forEach((resp, index) => {
          count = 0;
          const context = JSON.parse(resp.context);
          // nếu đều là câu hỏi mở đầu thì trả về luôn cho client vì chắc chắn đúng
          if (newContents.length === 1 && context.length === 1) {
            const response = resp.response;
            return res.status(200).json({
              data: response,
            });
          }
          // dùng 2 vòng for để kiểm tra
          for (let i = 0; i < context.length; i++) {
            const element = context[i].parts[0].text;
            for (let j = 0; j < newContents.length; j++) {
              const element2 = newContents[j].parts[0].text;
              const similarity = stringSimilarity.compareTwoStrings(
                element,
                element2
              );
              // lấy ra 2 câu hỏi và so sánh xem mức độ giống nhau
              if (similarity > 0.8) {
                count = count + 1;
              }
              // nếu gần giống thì tăng biến count lên 1
            }
          }
          resp.count = count;
        });

        const maxIndex = validResponses.reduce(
          (maxIdx, item, idx, validResponses) => {
            return item.count > validResponses[maxIdx].count ? idx : maxIdx;
          },
          0
        );
        // tìm ra câu trả lời có thể đúng nhất
        console.log("validResponses[maxIndex]", validResponses[maxIndex]);

        if (validResponses[maxIndex].count > 0) {
          const response = validResponses[maxIndex].response;
          return res.status(200).json({
            data: response,
          });
        }

        if (validResponses[maxIndex].count < 1) {
          console.log("No matching context found, getting new response");
          const response = await saveByResponseAI(
            contents,
            newContents,
            userMessage
          );
          return res.status(200).json({
            data: response,
          });
        }
        // nếu không đúng thì đi thu thập lại và trả về client
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

const saveByResponseAI = async (contents, newContents, userMessage) => {
  try {
    const response = await chatbotRepo.createResponse(contents);
    console.log("response", response);
    const newData = {
      question: userMessage,
      response,
      context: JSON.stringify(newContents),
    };
    await KnowledgeModel.create(newData);
    return response;
  } catch (error) {
    console.log("error", error);
    return "Hệ thống đang bảo trì!";
  }
};

module.exports = chatbotController;
