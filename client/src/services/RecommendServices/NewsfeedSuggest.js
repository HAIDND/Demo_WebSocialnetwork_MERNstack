import { API_BASE_URL } from "~/config/apiConfig";
import { getPostById } from "../postServices/postService";
function getToken() {
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  return tokenData?.token;
}
async function getNewsfeedSuggestId() {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE_URL}recommnend/getNewsFeed`, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      console.log("recomned newfeed", response);
      return await response.json();
    } else {
      throw new Error("Failed to get chat list");
    }
  } catch (error) {
    console.error(error);
  }
}
async function getNewsfeedSuggest() {
  try {
    const response = await getNewsfeedSuggestId();

    if (response) {
      let data = [];

      for (const post of response.data) {
        try {
          const fullPost = await getPostById(post.id);
          if (fullPost) {
            data.push(fullPost);
          }
        } catch (error) {
          console.error(`Lỗi khi fetch post id ${post.id}:`, error);
        }
      }

      return data;
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
export { getNewsfeedSuggest };
