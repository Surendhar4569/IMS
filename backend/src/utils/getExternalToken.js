import axios from "axios";
import https from "https";
import { pool } from "../config/database.js";

const TOKEN_REFRESH_MINUTES = 9;

// const httpsAgent = new https.Agent({
//   rejectUnauthorized: false,
// });

export const getExternalToken = async (userId) => {
  const result = await pool.query(
    `
        SELECT
            e.email,
            t.token,
            t.updated_at
        FROM employees e
        LEFT JOIN external_api_tokens t
            ON e.id = t.employee_id
        WHERE e.id = $1
        `,
    [userId],
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  const now = Date.now();

  if (user.token) {
    const updated = new Date(user.updated_at).getTime();
    const age = now - updated;

    if (age < TOKEN_REFRESH_MINUTES * 60 * 1000) {
      return user.token;
    }
  }

  console.log("gen new token");

  // Login to external API
  const response = await axios.post(
    `${process.env.VOICEGATE_URL}/login/`,
    {
      email: process.env.VOICEGATE_EMAIL,
      password: process.env.VOICEGATE_PASSWORD,
    },
    // {
    //   httpsAgent,
    // },
  );

  const newToken = response.data.token;

  await pool.query(
    `
        INSERT INTO external_api_tokens
        (
            employee_id,
            email,
            token,
            updated_at
        )
        VALUES
        ($1, $2, $3, NOW())
        ON CONFLICT (employee_id)
        DO UPDATE SET
            token = EXCLUDED.token,
            email = EXCLUDED.email,
            updated_at = NOW()
        `,
    [userId, user.email, newToken],
  );

  return newToken;
};
