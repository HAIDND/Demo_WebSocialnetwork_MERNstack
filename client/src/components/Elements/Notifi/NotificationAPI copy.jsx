// Lấy dữ liệu từ sessionStorage
const storedToken = sessionStorage.getItem("jwt");
// Parse JSON thành object
const tokenData = storedToken ? JSON.parse(storedToken) : null;
// Kiểm tra và sử dụng token
const token = tokenData.token;
// API service cho frontend
class NotificationAPI {
  static baseURL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

  // Tạo notification mới
  static async createNotification(notificationData) {
    try {
      const response = await fetch(`${this.baseURL}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notificationData),
      });

      return await response.json();
    } catch (error) {
      throw new Error(`Lỗi tạo notification: ${error.message}`);
    }
  }

  // Lấy danh sách notification
  static async getUserNotifications(userId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(
        `${this.baseURL}/notifications/${userId}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error(`Lỗi lấy notification: ${error.message}`);
    }
  }

  // Đánh dấu đã đọc
  static async markAsRead(userId, notificationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/notifications/${userId}/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error(`Lỗi đánh dấu đã đọc: ${error.message}`);
    }
  }

  // Đánh dấu tất cả đã đọc
  static async markAllAsRead(userId) {
    try {
      const response = await fetch(
        `${this.baseURL}/notifications/${userId}/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error(`Lỗi đánh dấu tất cả đã đọc: ${error.message}`);
    }
  }

  // Xóa notification
  static async deleteNotification(userId, notificationId) {
    try {
      const response = await fetch(
        `${this.baseURL}/notifications/${userId}/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error(`Lỗi xóa notification: ${error.message}`);
    }
  }

  // Lấy số lượng chưa đọc
  static async getUnreadCount(userId) {
    try {
      const response = await fetch(
        `${this.baseURL}/notifications/${userId}/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return await response.json();
    } catch (error) {
      throw new Error(`Lỗi lấy số lượng chưa đọc: ${error.message}`);
    }
  }
}
export default NotificationAPI;
