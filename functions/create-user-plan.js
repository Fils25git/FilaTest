// /.netlify/functions/create-user-plan.js
const { Pool } = require("pg");

// Configure your database connection
const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL, // Make sure your .env has DATABASE_URL
    ssl: { rejectUnauthorized: false } // for Netlify
});

exports.handler = async function(event) {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method not allowed" })
        };
    }

    try {
        const { email, lesson_title, lesson_content, language } = JSON.parse(event.body);

        if (!email || !lesson_title || !lesson_content || !language) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing required fields" })
            };
        }

        // Insert the lesson plan into your table
        const query = `
            INSERT INTO user_lesson_plans (email, lesson_title, lesson_content, language, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id
        `;

        const values = [email, lesson_title, lesson_content, language];

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
            body: JSON.stringify({ success: false, message: "Server error" })
        };
    }
};
