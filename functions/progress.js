exports.handler = async (event) => {
  try {
    console.log(`Request: ${event.httpMethod} - code: ${event.queryStringParameters?.code}`);
    
    let code = event.queryStringParameters?.code;
    
    if (event.httpMethod === 'GET') {
      if (code === 'all') {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_code: code, user_stats_points: 0 })
      };
    }
    
    if (event.httpMethod === 'PUT') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true })
      };
    }
    
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
