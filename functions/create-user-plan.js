const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" })
    };
  }

  try {
    const {
      email,
      lesson_title,
      lesson_content, // RAW HTML
      lesson_text,    // CLEAN TEXT
      language
    } = JSON.parse(event.body);

    if (!email || !lesson_title || !lesson_content || !lesson_text) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Missing required fields"
        })
      };
    }

    const query = `
      INSERT INTO user_lesson_plans
      (email, lesson_title, lesson_content, lesson_text, language, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `;

    const values = [
      email,
      lesson_title,
      lesson_content,
      lesson_text,
      language || "english"
    ];

    const result = await pool.query(query, values);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Lesson plan saved successfully",
        plan_id: result.rows[0].id
      })
    };

  } catch (err) {
    console.error("Error saving lesson plan:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Server error"
      })
    };
  }
};
