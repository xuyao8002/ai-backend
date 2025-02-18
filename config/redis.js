const redis = require('redis');


const client = redis.createClient({
	host: 'localhost',
	port: 6379,
	password: 'redis',
});

client.on('connect', () => {
  console.log('Redis connected');
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});
client.connect();
module.exports = client;
