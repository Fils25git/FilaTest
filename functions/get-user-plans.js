import { query } from './db.js';

export async function handler(event) {
  try {
    const email = event.queryStringParameters.email;

    // Get the user's ID first
    const userRes = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    const userId = userRes.rows[0]?.id;
    if (!userId) return { statusCode: 404, body: JSON.stringify([]) };

    // Fetch the last 10 lesson plans
    const plansRes = await query(
      `SELECT id, lesson_title, lesson_content, language, created_at
       FROM user_lesson_plans
       WHERE email = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(plansRes.rows)
    };

  } catch (err) {
    console.error("Error fetching user plans:", err);
    return { statusCode: 500, body: JSON.stringify([]) };
  }
}
