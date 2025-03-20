const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();

// Load environment variables
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cors());

// app.get('/api', function (req, res) {
//   res.json('Hello Decentracode')
// })

// Initialize provider and wallet
const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_PROJECT_ID);
const privateKey = process.env.PRIVATE_KEY; // Owner's private key
const wallet = new ethers.Wallet(privateKey, provider);

// Token contract details
const tokenContractAddress = '0xc004165d14776a8B94b511034cc537551372d255'; // Replace with your token contract address
const tokenAbi = [
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
];

const tokenContract = new ethers.Contract(tokenContractAddress, tokenAbi, wallet);

// In-memory storage for attendance data
const attendanceData = [];

// Register attendance endpoint
app.post('/register-attendance', async (req, res) => {
  const { address, name, sessionCode, signature, message } = req.body;

  try {
    // Verify the session code
    const expectedSessionCode = 'SESSION123'; // Replace with dynamic session code logic
    if (sessionCode !== expectedSessionCode) {
      return res.status(400).json({ success: false, error: 'Invalid session code' });
    }

    // Verify the signed message
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Check if the user has already registered for this session
    const existingAttendance = attendanceData.find(
      (record) => record.address === address && record.sessionCode === sessionCode
    );
    if (existingAttendance) {
      return res.status(400).json({ success: false, error: 'Already registered for this session' });
    }

    // Record attendance
    const attendanceRecord = {
      address,
      name,
      sessionCode,
      timestamp: new Date().toISOString(),
    };
    attendanceData.push(attendanceRecord);

    res.json({ success: true, message: 'Attendance registered successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// Claim tokens endpoint
app.post('/claim-tokens', async (req, res) => {
  const { address, amount } = req.body;

  try {
    // Reward tokens to the participant
    const tx = await tokenContract.rewardParticipant(address, ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// Get attendance history endpoint
app.get('/attendance-history/:address', (req, res) => {
  const { address } = req.params;
  const userAttendance = attendanceData.filter((record) => record.address === address);
  res.json({ success: true, data: userAttendance });
});

// Get token balance endpoint
app.get('/token-balance/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const balance = await tokenContract.balanceOf(address);
    res.json({ success: true, balance: ethers.utils.formatUnits(balance, 18) });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch token balance' });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});