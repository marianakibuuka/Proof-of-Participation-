const express = require('express');
const app = express();
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();
const mysql = require('mysql2/promise');


app.use(cors());
app.use(express.json()); // Parse JSON request bodies
// Create the connection pool outside the listener
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'attend_me',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');

    // Add this before table creation if database might not exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'attend_me'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'attend_me'}`);

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS whitelist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        address VARCHAR(42) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        address VARCHAR(42) NOT NULL,
        name VARCHAR(255) NOT NULL,
        sessionCode VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        signature TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (address) REFERENCES whitelist(address) ON DELETE CASCADE,
        INDEX (address),
        INDEX (sessionCode)
      )
    `);
    
    
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

app.get('/', function (req, res) {
  res.send('Hello World');
});

// Start server after initializing database
async function startServer() {
  try {
    await initializeDatabase();

    const { provider, tokenContract } = await initializeBlockchain();
    app.locals.provider = provider;
    app.locals.tokenContract = tokenContract;

    app.listen(5555, () => {
      console.log('🚀 Server running on port 5555');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

//Fullproof Way to initialize the blockchain.

async function initializeBlockchain() {
  try {
   
    // Using public RPC (less reliable)
   const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_END_POINT);
  
    const network = await provider.getNetwork();
    console.log(`Connected to ${network.name} (Chain ID: ${network.chainId})`);

    // 4. Initialize wallet
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`Wallet address: ${wallet.address}`);

    // 5. Initialize contract
    const tokenContract = new ethers.Contract(
      process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS,
      [
        {
          "constant": true,
          "inputs": [{ "name": "_owner", "type": "address" }],
          "name": "balanceOf",
          "outputs": [{ "name": "balance", "type": "uint256" }],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            { "name": "participant", "type": "address" },
            { "name": "amount", "type": "uint256" }
          ],
          "name": "rewardParticipant",
          "outputs": [],
          "type": "function"
        }
      ],
      wallet
    );

    console.log("This is here: Now")
    return { provider, wallet, tokenContract };
  } catch (error) {
    console.error('❌ Blockchain initialization failed:', error.message);
    throw error;
  }
}

// API Endpoints
app.post('/whitelist/add', async (req, res) => {
  try {
    const { address } = req.body;
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    await pool.query(
      'INSERT INTO whitelist (address) VALUES (?) ON DUPLICATE KEY UPDATE address=address',
      [address.toLowerCase()]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Whitelist error:', error);
    res.status(500).json({ error: 'Failed to update whitelist' });
  }
});






