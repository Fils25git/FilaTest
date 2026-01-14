import { query } from './db.js';

export async function handler(event) {
  try {
    const email = event.queryStringParameters?.email;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, plans: [], error: 'Email is required' }),
      };
    }

    const result = await query(
      `SELECT lesson_plans FROM users WHERE email = $1`,
      [email]
    );

    const plans = result.rows[0]?.lesson_plans || [];

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, plans }),
    };
  } catch (err) {
    console.error('Error fetching user plans:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, plans: [], error: err.message }),
    };
  }
      }
