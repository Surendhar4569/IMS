import { getExternalToken } from "../utils/getExternalToken.js";
import axios from "axios";
import https from "https";
import api from "../utils/axiosConfig.js";

export const getMembers = async (req, res) => {
  const token = await getExternalToken(3);

  const response = await api.get(`/members/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  res.json(response.data);
  console.log(response.data);
};
