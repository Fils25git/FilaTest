import { query } from './db.js'; // your db helper
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

    const res = await query(
      'SELECT name, email, phone FROM users WHERE email = $1',
      [payload.email]
    );

    if (!res.rows.length) return { statusCode: 404, body: 'User not found' };

    return {
      statusCode: 200,
      body: JSON.stringify(res.rows[0])
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
}
