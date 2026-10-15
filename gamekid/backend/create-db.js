const pg = require('pg');

const client = new pg.Client({
  user: 'postgres',
  password: '123123',
  host: 'localhost',
  port: 5432,
  database: 'postgres', // connect to default db first
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return client.query('CREATE DATABASE wewin_db;');
  })
  .then(() => {
    console.log('Database wewin_db created successfully');
    return client.end();
  })
  .catch((err) => {
    if (err.message.includes('already exists')) {
      console.log('Database wewin_db already exists');
      return client.end();
    }
    console.error('Error:', err.message);
    return client.end();
  });
