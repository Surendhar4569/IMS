import { getExternalToken } from "../utils/getExternalToken.js";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const getMembers = async (req, res) => {
  const token = await getExternalToken(2);
  console.log(token);

  const response = await axios.get(`${process.env.VOICEGATE_URL}/members/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    httpsAgent,
  });

  res.json(response.data);
//   console.log(response.data);
};
