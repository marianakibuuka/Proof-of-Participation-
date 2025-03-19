# Proof of Participation (PoP) - Session Attendance Tracker
## Overview
This project is a Proof of Participation (PoP) system designed to track attendance and reward/ gift tokens to students in an ongoing cohort at Decentracode. It uses blockchain technology (Ethereum) to:

-Register attendance for sessions.

-Reward participants with tokens for their participation.

-Maintain a transparent and immutable record of attendance.

## The system consists of:

-A React frontend for user interaction.

-An Express backend for handling attendance registration and token distribution.

-A smart contract for managing token rewards...

## Students can:

-Connect their Ethereum wallet (e.g., MetaMask).

-Register attendance for a session by signing a message.

-Claim tokens as a reward for their participation.

-View their attendance history.

##Features
Wallet Integration: Connect your Ethereum wallet (MetaMask) to interact with the system.

Attendance Registration: Register attendance for a session by providing your name, session code, and wallet address.

Token Rewards: Claim tokens as a reward for attending sessions.

Attendance History: View your attendance history, including session codes and timestamps.

Blockchain Transparency: All attendance records and token transactions are stored on the Ethereum blockchain (Sepolia testnet).

##Prerequisites
Before running the project, ensure you have the following installed:

Node.js (v16 or higher)

MetaMask (browser extension)

Ethers.js (for blockchain interactions)

Infura Account (for connecting to the Ethereum network)

Sepolia Testnet ETH (for gas fees)

## Setup Instructions
1. Clone the Repository
git clone https://github.com/your-username/proof-of-participation.git

cd proof-of-participation
3. Install Dependencies
Frontend (React)

cd client

npm install
Backend (Express)


cd server
npm install

4. Configure Environment Variables
Frontend
Create a .env file in the client directory:

env

REACT_APP_INFURA_PROJECT_ID=your_infura_project_id
Backend
Create a .env file in the server directory:


INFURA_PROJECT_ID=your_infura_project_id
PRIVATE_KEY=your_wallet_private_key

4. Deploy the Smart Contract
Compile and deploy the token contract (e.g., using Remix or Hardhat).

Update the tokenContractAddress in both the frontend (App.js) and backend (server.js) with the deployed contract address.

5. Run the Application
Frontend

cd client
npm start
Backend

cd server
npm start

## Usage
1. Connect Your Wallet
Click the Connect Now button to connect your MetaMask wallet.

Ensure your wallet is connected to the Sepolia Testnet.

2. Register Attendance
Enter your name, session code, and wallet address.

Click Register Attendance to sign the message and register your attendance.

3. Claim Tokens
Click Claim Tokens to receive tokens as a reward for your participation.

The transaction hash will be displayed once the tokens are successfully claimed.

## ISSUES
4. View Attendance History
Your attendance history, including session codes and timestamps, will be displayed below the form.

Smart Contract Details
The token contract (tokenContract) has the following functions:

balanceOf(address _owner): Returns the token balance of a participant.

rewardParticipant(address participant, uint256 amount): Rewards a participant with tokens.

Frontend: React, Ethers.js

Backend: Express, Ethers.js

Blockchain: Ethereum (Sepolia Testnet), Solidity

Tools: MetaMask, Infura


## Contributing
Contributions are welcome! If you'd like to contribute, please:

Fork the repository.


Submit a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Contact
For questions or feedback, please contact:

Your Name: your.email@example.com

GitHub: your-username


