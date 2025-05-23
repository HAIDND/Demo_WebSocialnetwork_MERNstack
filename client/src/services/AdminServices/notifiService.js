// Notification routes
//router.get("/notifications", authenticateToken, adminMiddleware, AdminController.getAllNotifications);

import { API_BASE_URL } from "~/config/apiConfig";

const adminGetNotifi = async () => {
  // Lấy dữ liệu từ sessionStorage
  const storedToken = sessionStorage.getItem("jwt");
  // Parse JSON thành object
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  // Kiểm tra và sử dụng token
  const token = tokenData.token;
  try {
    const response = await fetch(`${API_BASE_URL}admin/notifications`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};
//router.delete("/notifications/:notificationId", adminMiddleware, AdminController.deleteNotification);

const adminDeleteNotifi = async (notificationId) => {
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  const token = tokenData.token;
  try {
    const response = await fetch(
      `${API_BASE_URL}admin/notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error(error);
  }
};
export { adminGetNotifi, adminDeleteNotifi };
