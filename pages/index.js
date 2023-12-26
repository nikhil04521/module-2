import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("Nikhil Kumar");
  const [country, setCountry] = useState("India");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit(transactionAmount);
        await tx.wait();

        const newTransaction = {
          type: "Deposit",
          amount: transactionAmount,
          hash: tx.hash,
        };

        setTransactionHistory([...transactionHistory, newTransaction]);
        setTransactionAmount(""); // Clear the transaction amount after deposit
        getBalance();
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(transactionAmount);
        await tx.wait();

        const newTransaction = {
          type: "Withdraw",
          amount: transactionAmount,
          hash: tx.hash,
        };

        setTransactionHistory([...transactionHistory, newTransaction]);
        setTransactionAmount(""); // Clear the transaction amount after withdrawal
        getBalance();
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  };

  const deleteMiniStatement = () => {
    setTransactionHistory([]); // Clear the transaction history
  };

  const renderTransactionHistory = () => {
    return (
      <div>
        <h2>Mini Statement</h2>
        <ul>
          {transactionHistory.slice(-5).map((transaction, index) => (
            <li key={index}>
              {index + 1}. Type: {transaction.type}, Amount: {transaction.amount}, Hash: {transaction.hash}
            </li>
          ))}
        </ul>
        <button onClick={deleteMiniStatement}>Delete Mini Statement</button>
      </div>
    );
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Account Holder: {accountHolderName}</p>
        <p>Country: {country}</p>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <label>
            Amount:
            <input type="number" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} />
          </label>
        </div>
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
        {renderTransactionHistory()}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: orange;
          padding: 20px;
          border-radius: 10px;
        }

        input {
          margin-left: 10px;
        }
      `}</style>
    </main>
  );
}
