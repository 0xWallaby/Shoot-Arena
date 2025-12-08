import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export const StartPage = () => {
    const [connecting, setConnecting] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);
    const navigate = useNavigate();

    // Check if wallet was previously connected
    useEffect(() => {
        const storedWallet = localStorage.getItem('walletAddress');
        if (storedWallet) {
            setWalletConnected(true);
            setWalletAddress(storedWallet);
        }
    }, []);

    const handleConnectWallet = async () => {
        setConnecting(true);

        try {
            // Check for Phantom wallet (most popular Solana wallet)
            if (window.solana && window.solana.isPhantom) {
                const response = await window.solana.connect();
                const publicKey = response.publicKey.toString();

                // Store in localStorage
                localStorage.setItem('walletAddress', publicKey);
                localStorage.setItem('walletConnected', 'true');

                setWalletConnected(true);
                setWalletAddress(publicKey);
                setConnecting(false);
            }
            // Check for Solflare
            else if (window.solflare && window.solflare.isSolflare) {
                await window.solflare.connect();
                const publicKey = window.solflare.publicKey.toString();

                localStorage.setItem('walletAddress', publicKey);
                localStorage.setItem('walletConnected', 'true');

                setWalletConnected(true);
                setWalletAddress(publicKey);
                setConnecting(false);
            }
            // Check for any Solana wallet
            else if (window.solana) {
                const response = await window.solana.connect();
                const publicKey = response.publicKey.toString();

                localStorage.setItem('walletAddress', publicKey);
                localStorage.setItem('walletConnected', 'true');

                setWalletConnected(true);
                setWalletAddress(publicKey);
                setConnecting(false);
            }
            else {
                alert("No Solana wallet detected! Please install Phantom wallet from phantom.app");
                setConnecting(false);
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            if (error.code === 4001) {
                alert("Wallet connection rejected. Please try again.");
            } else {
                alert("Failed to connect wallet. Please try again.");
            }
            setConnecting(false);
        }
    };

    const handleDisconnect = () => {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletConnected');
        setWalletConnected(false);
        setWalletAddress(null);
    };

    const handleProceedToGame = () => {
        navigate('/game');
    };

    const truncateAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
        <div style={{
            top: 0,
            left: 0,
            background: "#806247",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            overflowY: "auto",
            padding: "40px 20px",
            boxSizing: "border-box",
        }}>
            {/* Leaderboard Link - Top Right */}
            <Link
                to="/leaderboard"
                style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    color: "white",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.25)";
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.15)";
                }}
            >
                🏆 Leaderboard
            </Link>

            <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "24px",
                padding: "50px",
                maxWidth: "520px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                textAlign: "center",
                marginTop: "60px",
                marginBottom: "20px",
            }}>
                {/* Logo/Icon */}
                <div style={{
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "center",
                }}>
                    <img src={logo} alt="ShootPlay Logo" style={{ width: "120px", height: "120px" }} />
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    color: "#333",
                }}>
                    Welcome to ShootPlay
                </h1>

                {/* Description */}
                <p style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "40px",
                    lineHeight: "1.6",
                }}>
                    Connect your Solana wallet to save your highscore, or continue without connecting.
                </p>

                {/* Wallet Status */}
                {walletConnected && (
                    <div style={{
                        background: "#e8f5e9",
                        border: "2px solid #4caf50",
                        borderRadius: "12px",
                        padding: "15px",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "20px" }}>✅</span>
                            <div style={{ textAlign: "left" }}>
                                <div style={{ fontSize: "12px", color: "#666" }}>Connected Wallet</div>
                                <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#333", fontWeight: "600" }}>
                                    {truncateAddress(walletAddress)}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#e74c3c",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            Disconnect
                        </button>
                    </div>
                )}

                {/* Connect Wallet Button or Proceed Button */}
                {walletConnected ? (
                    <button
                        onClick={handleProceedToGame}
                        style={{
                            width: "100%",
                            padding: "12px",
                            fontSize: "15px",
                            fontWeight: "bold",
                            color: "white",
                            background: "#4caf50",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            marginBottom: "15px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 8px 25px rgba(76, 175, 80, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }}
                    >
                        🎯 Proceed to Game
                    </button>
                ) : (
                    <button
                        onClick={handleConnectWallet}
                        disabled={connecting}
                        style={{
                            width: "100%",
                            padding: "12px",
                            fontSize: "15px",
                            fontWeight: "bold",
                            color: "white",
                            background: connecting ? "#999" : "#806247",
                            border: "none",
                            borderRadius: "8px",
                            cursor: connecting ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            marginBottom: "15px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                        }}
                        onMouseEnter={(e) => {
                            if (!connecting) {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 8px 25px rgba(128, 98, 71, 0.5)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!connecting) {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                            }
                        }}
                    >
                        {connecting ? "Connecting..." : "Connect Solana Wallet"}
                    </button>
                )}

                {/* Wallet Support Info */}
                {!walletConnected && (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "15px",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                    }}>
                        <div style={{
                            padding: "6px 12px",
                            background: "#f8f9fa",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: "600",
                        }}>
                            Phantom
                        </div>
                        <div style={{
                            padding: "6px 12px",
                            background: "#f8f9fa",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: "600",
                        }}>
                            Solflare
                        </div>
                        <div style={{
                            padding: "6px 12px",
                            background: "#f8f9fa",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#666",
                            fontWeight: "600",
                        }}>
                            Backpack
                        </div>
                    </div>
                )}

                {/* Continue Without Button */}
                <button
                    onClick={handleProceedToGame}
                    disabled={connecting}
                    style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#666",
                        background: "transparent",
                        border: "2px solid #806247",
                        borderRadius: "8px",
                        cursor: connecting ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        if (!connecting) {
                            e.target.style.borderColor = "#806247";
                            e.target.style.color = "#806247";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!connecting) {
                            e.target.style.borderColor = "#806247";
                            e.target.style.color = "#666";
                        }
                    }}
                >
                    {walletConnected ? "Play Without Saving Score" : "Continue Without Wallet"}
                </button>

                {/* Benefits List */}
                <div style={{
                    marginTop: "30px",
                    padding: "20px",
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    textAlign: "left",
                }}>
                    <p style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#999",
                        marginBottom: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                    }}>
                        With Solana Wallet Connected:
                    </p>
                    <div style={{ fontSize: "14px", color: "#666", lineHeight: "1.8" }}>
                        ✓ Save your highscore to the leaderboard<br />
                        ✓ Track your total kills on-chain<br />
                        ✓ Compete for top rankings
                    </div>
                </div>

                {/* Phantom Install Link */}
                {!walletConnected && (
                    <div style={{
                        marginTop: "15px",
                        fontSize: "12px",
                        color: "#999",
                    }}>
                        Don't have a wallet?{" "}
                        <a
                            href="https://phantom.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "#806247",
                                textDecoration: "none",
                                fontWeight: "600",
                            }}
                        >
                            Install Phantom
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

