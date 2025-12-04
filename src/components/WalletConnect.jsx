import { useState } from "react";

export const WalletConnect = ({ onContinue }) => {
    const [connecting, setConnecting] = useState(false);

    const handleConnectWallet = async () => {
        setConnecting(true);

        try {
            // Check for Phantom wallet (most popular Solana wallet)
            if (window.solana && window.solana.isPhantom) {
                const response = await window.solana.connect();
                const publicKey = response.publicKey.toString();

                onContinue({
                    connected: true,
                    address: publicKey,
                    wallet: 'Phantom',
                });
            }
            // Check for Solflare
            else if (window.solflare && window.solflare.isSolflare) {
                await window.solflare.connect();
                const publicKey = window.solflare.publicKey.toString();

                onContinue({
                    connected: true,
                    address: publicKey,
                    wallet: 'Solflare',
                });
            }
            // Check for any Solana wallet
            else if (window.solana) {
                const response = await window.solana.connect();
                const publicKey = response.publicKey.toString();

                onContinue({
                    connected: true,
                    address: publicKey,
                    wallet: 'Solana',
                });
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

    const handleContinueWithout = () => {
        onContinue({
            connected: false,
            address: null,
            wallet: null,
        });
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
        }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "24px",
                padding: "50px",
                maxWidth: "520px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                textAlign: "center",
            }}>
                {/* Logo/Icon */}
                <div style={{
                    fontSize: "80px",
                    marginBottom: "20px",
                }}>
                    🎮
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "15px",
                    color: "#333",
                }}>
                    Welcome to Battle Arena
                </h1>

                {/* Description */}
                <p style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "40px",
                    lineHeight: "1.6",
                }}>
                    Connect your Solana wallet to unlock SOL rewards, NFT skins, and on-chain stats. Or continue without connecting.
                </p>

                {/* Connect Wallet Button */}
                <button
                    onClick={handleConnectWallet}
                    disabled={connecting}
                    style={{
                        width: "100%",
                        padding: "18px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "white",
                        background: connecting
                            ? "linear-gradient(135deg, #999 0%, #666 100%)"
                            : "linear-gradient(135deg, #14F195 0%, #9945FF 100%)",
                        border: "none",
                        borderRadius: "12px",
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
                            e.target.style.boxShadow = "0 8px 25px rgba(153, 69, 255, 0.5)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!connecting) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                        }
                    }}
                >
                    <span style={{ fontSize: "24px" }}>👛</span>
                    {connecting ? "Connecting..." : "Connect Solana Wallet"}
                </button>

                {/* Wallet Support Info */}
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

                {/* Continue Without Button */}
                <button
                    onClick={handleContinueWithout}
                    disabled={connecting}
                    style={{
                        width: "100%",
                        padding: "18px",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#666",
                        background: "transparent",
                        border: "2px solid #ddd",
                        borderRadius: "12px",
                        cursor: connecting ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        if (!connecting) {
                            e.target.style.borderColor = "#9945FF";
                            e.target.style.color = "#9945FF";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!connecting) {
                            e.target.style.borderColor = "#ddd";
                            e.target.style.color = "#666";
                        }
                    }}
                >
                    Continue Without Wallet
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
                        ✓ Earn SOL rewards for wins<br />
                        ✓ Unlock exclusive NFT weapon skins<br />
                        ✓ Track stats on Solana blockchain<br />
                        ✓ Trade items on Magic Eden
                    </div>
                </div>

                {/* Phantom Install Link */}
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
                            color: "#9945FF",
                            textDecoration: "none",
                            fontWeight: "600",
                        }}
                    >
                        Install Phantom
                    </a>
                </div>
            </div>
        </div>
    );
};