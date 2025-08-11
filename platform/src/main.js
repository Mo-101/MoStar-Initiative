import { ethers } from "ethers";

const API_BASE = "http://localhost:3001/api"; // Placeholder for your API base URL

async function ensurePolygon() {
  const chainId = "0x89"; // Polygon Mainnet
  if (typeof window.ethereum === "undefined") {
    return;
  }
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (switchError) {
    // If chain not added
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId,
              chainName: "Polygon Mainnet",
              nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
              rpcUrls: ["https://polygon-pokt.nodies.app"],
              blockExplorerUrls: ["https://polygonscan.com/"],
            },
          ],
        });
      } catch (addError) {
        console.error("Failed to add Polygon network", addError);
        alert("Failed to add the Polygon network to MetaMask.");
      }
    } else {
      console.error("Failed to switch to Polygon network", switchError);
      alert("Failed to switch to the Polygon network. Please do it manually.");
    }
  }
}

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ensurePolygon(); // Ensure we are on Polygon network first

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      document.getElementById("walletAddress").innerText = walletAddress;
      console.log("Wallet connected:", walletAddress);

      // Send to backend for session tie-in
      await fetch(`${API_BASE}/register-wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress }),
      });
    } catch (err) {
      console.error("Connection error", err);
    }
  } else {
    alert("MetaMask is required to connect your wallet!");
  }
}

async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            const walletAddress = accounts[0];
            document.getElementById('walletAddress').innerText = walletAddress;
            console.log('Wallet already connected:', walletAddress);
            await ensurePolygon();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById("connectWalletBtn");
    if(connectButton) {
        connectButton.addEventListener("click", connectWallet);
    }
    checkConnection();
});


