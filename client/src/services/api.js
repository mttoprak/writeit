import axios from "axios";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8800/api",
    withCredentials: true,
});

export const getPosts = async (page = 1, limit = 10, sort = "hot", time = "day", filter = "global", subName = null) => {
    let url = `/posts/feed?page=${page}&limit=${limit}&sort=${sort}&t=${time}&filter=${filter}`;
    if (subName) {
        url += `&subName=${subName}`;
    }
    const response = await api.get(url);
    return response.data;
};

export const getVoteStatus = async (postId) => {
    const response = await api.get(`/posts/getvote/${postId}`);
    return response.data;
};

export const votePost = async (postId, voteType) => {
    const response = await api.put(`/posts/vote/${postId}`, { voteType });
    return response.data;
};

export const getComments = async (postId) => {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
};

export const createComment = async (commentData) => {
    const response = await api.post("/comments/create", commentData);
    return response.data;
};

export const voteComment = async (commentId, voteType) => {
    const response = await api.put(`/comments/vote/${commentId}`, { voteType });
    return response.data;
};

export const savePost = async (postId) => {
    const response = await api.put(`/users/save/${postId}`);
    return response.data;
};

export const updateUser = async (userData) => {
    const response = await api.put("/users/update", userData);
    return response.data;
};

export default api;