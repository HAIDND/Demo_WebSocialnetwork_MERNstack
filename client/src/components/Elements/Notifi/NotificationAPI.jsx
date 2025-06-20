const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000/api";

// Hàm lấy token từ sessionStorage
const getToken = () => {
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  return tokenData?.token;
};

// Tạo notification mới
const createNotification = async (notificationData) => {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(notificationData),
    });
    return await response.json();
  } catch (error) {
    console.error("Lỗi tạo notification:", error);
  }
};

// Lấy danh sách notification của user
const getUserNotifications = async (userId, params = {}) => {
  const token = getToken();
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(
      `${API_BASE_URL}/notifications/${userId}?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Lỗi lấy notification:", error);
  }
};

// Đánh dấu một thông báo là đã đọc
const markAsRead = async (userId, notificationId) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${userId}/${notificationId}/read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Lỗi đánh dấu đã đọc:", error);
  }
};

// Đánh dấu tất cả là đã đọc
const markAllAsRead = async (userId) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${userId}/read-all`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Lỗi đánh dấu tất cả đã đọc:", error);
  }
};

// Xóa một notification
const deleteNotification = async (userId, notificationId) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${userId}/${notificationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Lỗi xóa notification:", error);
  }
};

// Lấy số lượng chưa đọc
const getUnreadCount = async (userId) => {
  const token = getToken();
  try {
    const response = await fetch(
      `${API_BASE_URL}/notifications/${userId}/unread-count`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Lỗi lấy số lượng chưa đọc:", error);
  }
};

export {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
