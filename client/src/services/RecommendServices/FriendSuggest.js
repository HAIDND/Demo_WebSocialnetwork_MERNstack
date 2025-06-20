import { API_BASE_URL } from "~/config/apiConfig";
function getToken() {
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  return tokenData?.token;
}
async function getFriendSuggestionList() {
  const token = getToken();
  try {
    const response = await fetch(
      `${API_BASE_URL}recommnend/getFriendSuggestions`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Failed to get chat list");
    }
  } catch (error) {
    console.error(error);
  }
}
//   try {
//     const res = await fetch(`${API_BASE_URL}posts/getPostById/${userId}`);
//     if (!res.ok) throw new Error("Post not found");
//     const data = await res.json();
//     return data;
//   } catch (err) {
//     console.error("Error fetching post:", err);
//     throw err;
//   }
// }
export { getFriendSuggestionList };
