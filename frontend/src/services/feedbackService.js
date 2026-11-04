import axios from "axios";

const API_URL = "http://localhost:5000/api/feedback";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const submitFeedback = async (data) => (await axios.post(API_URL, data, auth())).data;
export const getMyFeedback = async () => (await axios.get(`${API_URL}/mine`, auth())).data;
export const getActiveAnnouncements = async () =>
  (await axios.get(`${API_URL}/announcements`, auth())).data;
