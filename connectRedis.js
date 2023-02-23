//for all env variables imports
require("dotenv").config();

const redis =require('redis');

const client = redis.createClient({});

client.on('connect', function(){
    console.log('Connected to Redis...');
}); 

client.on('error', (err) => console.log('Redis Client Error', err));

async function connectDatabase()
{
    await client.connect();
}

connectDatabase();

module.exports = {client};