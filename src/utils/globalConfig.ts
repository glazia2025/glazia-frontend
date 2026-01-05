import axios from "axios";

export const loadGlobalConfig = () => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.glazia.in"}/api/quotations/config`;
  const token = localStorage.getItem("authToken");
  if (token) {
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.data);
  }
};

export const saveGlobalConfig = (config: any) => {
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.glazia.in"}/api/quotations/config`;
  const token = localStorage.getItem("authToken");
  if (token) {
    return axios.post(url, config, { headers: { Authorization: `Bearer ${token}` } });
  }
};
