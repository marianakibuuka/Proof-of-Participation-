/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [name, setName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // Token contract details
  const tokenContractAddress = 'YOUR_TOKEN_CONTRACT_ADDRESS'; // Replace with your token contract address
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

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);
      setWalletConnected(true);
      alert('Wallet connected!');
      fetchAttendanceHistory(address);
    } else {
      alert('Please install MetaMask!');
    }
  };

  const fetchAttendanceHistory = async (address) => {
    try {
      const response = await fetch(`http://localhost:4000/attendance-history/${address}`);
      const result = await response.json();
      if (result.success) {
        setAttendanceHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  const registerAttendance = async () => {
    if (!name || !sessionCode || (!userAddress && !manualAddress)) {
      alert('Please fill in all fields and connect your wallet or enter your wallet address.');
      return;
    }

    try {
      const message = `I, ${name}, am registering attendance for session: ${sessionCode}.`;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);

      const response = await fetch('/register-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: userAddress || manualAddress,
          name,
          sessionCode,
          signature,
          message,
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Attendance registered successfully!');
        fetchAttendanceHistory(userAddress || manualAddress);
      } else {
        alert(result.error || 'Failed to register attendance.');
      }
    } catch (error) {
      console.error('Error registering attendance:', error);
    }
  };

  const claimTokens = async () => {
    if (!userAddress && !manualAddress) {
      alert('Please connect your wallet or enter your wallet address.');
      return;
    }

    try {
      const message = `I am claiming tokens for my attendance.`;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);

      const response = await fetch('/claim-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress || manualAddress, amount: '10' }),
      });
      const result = await response.json();
      if (result.success) {
        setTransactionHash(result.transactionHash);
        alert('Tokens claimed successfully!');
      } else {
        alert(result.error || 'Failed to claim tokens.');
      }
    } catch (error) {
      console.error('Error claiming tokens:', error);
    }
  };

  // Fetch attendance history when manual address changes
  useEffect(() => {
    if (manualAddress) {
      fetchAttendanceHistory(manualAddress);
    }
  }, [manualAddress]);

  return (
    <div className="App">
      <h1>Welcome To Session</h1>
      {!walletConnected ? (
        <button className="connect-button" onClick={connectWallet}>
          Connect Now
        </button>
      ) : (
        <div className="form-container">
          <p>Wallet connected!</p>
          <div className="input-group">
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </label>
          </div>
          <div className="input-group">
            <label>
              Session Code:
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="Enter session No"
              />
            </label>
          </div>
          <div className="input-group">
            <label>
              Wallet Address:
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter your wallet address"
              />
            </label>
          </div>
          <button className="register-button" onClick={registerAttendance}>
            Register Attendance
          </button>
          <button className="claim-button" onClick={claimTokens}>
            Claim Tokens
          </button>
          {transactionHash && (
            <div className="transaction-section">
              <p>
                Transaction Hash:{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {transactionHash}
                </a>
              </p>
            </div>
          )}
          <div className="user-details">
            <h3>User Details</h3>
            <p><strong>Wallet Address:</strong> {userAddress || manualAddress}</p>
          </div>
          <div className="attendance-history">
            <h3>Your Attendance History:</h3>
            {attendanceHistory.length > 0 ? (
              <ul>
                {attendanceHistory.map((record, index) => (
                  <li key={index}>
                    <p><strong>Session Code:</strong> {record.sessionCode}</p>
                    <p><strong>Date:</strong> {new Date(record.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No attendance history found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;