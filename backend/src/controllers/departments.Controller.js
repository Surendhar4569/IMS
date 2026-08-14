import { getExternalToken } from "../utils/getExternalToken.js";
import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

export const getDepartments = async (req, res) => {

    const { user_id, salt } = req.query;
    

    const token = await getExternalToken(user_id, salt);
    // console.log(token);

    const response = await axios.get(`${process.env.VOICEGATE_URL}/department/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        httpsAgent,
    });

    res.json(response.data);
    //   console.log(response.data);
};