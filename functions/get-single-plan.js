import { query } from './db.js';
import jwt from 'jsonwebtoken';

export async function handler(event) {
  try {
    const authHeader = event.headers.authorization;
    if (!authHeader) return { statusCode: 401, body: 'Unauthorized' };

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return { statusCode: 401, body: 'Invalid token' };
    }

    const { id } = event.pathParameters || {}; // Netlify: :id in route
    if (!id) return { statusCode: 400, body: 'Plan ID required' };

    const res = await query(
      'SELECT id, lesson_title AS title, lesson_content AS html FROM user_lesson_plans WHERE id = $1 AND user_id = (SELECT id FROM users WHERE email = $2)',
      [id, payload.email]
    );

    if (!res.rows.length) return { statusCode: 404, body: 'Plan not found' };

    return {
      statusCode: 200,
      body: JSON.stringify(res.rows[0])
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
}
