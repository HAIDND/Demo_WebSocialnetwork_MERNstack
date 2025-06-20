import { API_BASE_URL } from "~/config/apiConfig";
import { getNewsfeedSuggest } from "../RecommendServices/NewsfeedSuggest";
async function getPostById(postId) {
  try {
    const res = await fetch(`${API_BASE_URL}posts/getPostById/${postId}`);
    if (!res.ok) throw new Error("Post not found");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching post:", err);
    throw err;
  }
}
const getPost = async () => {
  //const recommnedgetNewsfeedSuggest
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  const token = tokenData?.token;
  try {
    // Gửi request lên server
    const response = await fetch(`${API_BASE_URL}posts/userPosts`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token, // Thêm Bearer token
      },
    });

    return await response.json();
  } catch (err) {
    console.error(err);
  }
};
// Updated getPost function to support pagination
// const getPost = async (params = {}) => {
//   const storedToken = sessionStorage.getItem("jwt");
//   const tokenData = storedToken ? JSON.parse(storedToken) : null;
//   const token = tokenData?.token;
//   try {
//     const { page = 1, limit = 5, userId } = params;

//     const queryParams = new URLSearchParams({
//       page: page.toString(),
//       limit: limit.toString(),
//       ...(userId && { userId }),
//     });
//     const response = await fetch(
//       `${API_BASE_URL}posts/userPosts?${queryParams}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           // Add auth headers if needed
//           authorization: "Bearer " + token, // Thêm Bearer token
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch posts");
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     throw error;
//   }
// };
//call api create post
const createPost = async ({ content, images, video, visibility, location }) => {
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  const token = tokenData?.token;
  console.log("images", images);
  const formData = new FormData();
  formData.append("content", content);

  console.log(formData);
  if (images) images.forEach((file) => formData.append("images", file)); // ảnh
  if (video) formData.append("video", video);
  if (location) formData.append("location", location);
  formData.append("visibility", visibility);
  console.log("form lasttest");
  console.log(formData);

  try {
    const response = await fetch(`${API_BASE_URL}posts/create`, {
      method: "POST",
      headers: {
        authorization: "Bearer " + token,
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
};
//old create post
// const createPost = async (content, image, video, visibility) => {
//   const storedToken = sessionStorage.getItem("jwt");
//   const tokenData = storedToken ? JSON.parse(storedToken) : null;
//   const token = tokenData?.token;

//   const formData = new FormData();
//   formData.append("content", content);
//   console.log(formData);
//   if (image) formData.append("image", image);
//   if (video) formData.append("video", video);
//   formData.append("visibility", visibility);
//   console.log("form lasttest");
//   console.log(formData);

//   try {
//     const response = await fetch(`${API_BASE_URL}posts/create`, {
//       method: "POST",
//       headers: {
//         authorization: "Bearer " + token,
//       },
//       body: formData,
//     });
//     return await response.json();
//   } catch (error) {
//     console.error(error);
//     return { success: false, error };
//   }
// };
//cal api update commnet
const updatePost = async (postId, content, image) => {
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  const token = tokenData?.token;

  const formData = new FormData();
  formData.append("postId", postId);
  formData.append("content", content);
  // console.log(formData);
  formData.append("images", image);

  try {
    let response = await fetch(`${API_BASE_URL}posts/edit-post`, {
      method: "PUT",
      headers: {
        authorization: "Bearer " + token, // Thêm Bearer token
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};
//call api like post
const likePost = async (postId, token) => {
  try {
    let response = await fetch(`${API_BASE_URL}posts/like`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token, // Thêm Bearer token
      },
      body: JSON.stringify(postId),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

//call api unlike post
const unLikePost = async (postId, token) => {
  try {
    let response = await fetch(`${API_BASE_URL}posts/unlike`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token, // Thêm Bearer token
      },
      body: JSON.stringify(postId),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};
//call api comment post
const createComment = async (data) => {
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  const token = tokenData?.token;
  try {
    let response = await fetch(`${API_BASE_URL}posts/comment`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token, // Thêm Bearer token
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

//cal api update commnet
const editComment = async (formData) => {
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  const token = tokenData?.token;
  try {
    let response = await fetch(`${API_BASE_URL}posts/edit-comment`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token, // Thêm Bearer token
      },
      body: JSON.stringify(formData),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

//cal api update commnet
const deleteComment = async (postId, commentId) => {
  const storedToken = sessionStorage.getItem("jwt");
  const tokenData = storedToken ? JSON.parse(storedToken) : null;
  const token = tokenData?.token;
  try {
    let response = await fetch(`${API_BASE_URL}posts/delete-comment`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token, // Thêm Bearer token
      },
      body: JSON.stringify({ postId: postId, commentId: commentId }),
    });
    return await response.json();
  } catch (error) {
    console.log(error);
  }
};

export {
  getPost,
  getPostById,
  updatePost,
  likePost,
  createComment,
  unLikePost,
  createPost,
  editComment,
  deleteComment,
};
