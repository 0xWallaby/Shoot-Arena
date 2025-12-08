import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard, getUserRank } from "../lib/supabase.js";

export const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [myRank, setMyRank] = useState(null);
    const [myData, setMyData] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);

    useEffect(() => {
        // Get wallet address from localStorage
        const storedWallet = localStorage.getItem('walletAddress');
        setWalletAddress(storedWallet);

        const fetchData = async () => {
            setLoading(true);
            
            // Fetch top 10
            const result = await getLeaderboard(10);
            if (result.success) {
                setLeaderboard(result.data || []);
            } else {
                setError("Failed to load leaderboard");
                setLoading(false);
                return;
            }

            // If user has a wallet, fetch their rank
            if (storedWallet) {
                const rankResult = await getUserRank(storedWallet);
                if (rankResult.success && rankResult.rank) {
                    setMyRank(rankResult.rank);
                    setMyData(rankResult.data);
                }
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const truncateAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    // Check if user is in top 10
    const isUserInTop10 = walletAddress && leaderboard.some(
        entry => entry.wallet_address === walletAddress
    );

    // Check if user is in top 3
    const getUserPositionInTop10 = () => {
        if (!walletAddress) return -1;
        return leaderboard.findIndex(entry => entry.wallet_address === walletAddress);
    };

    const userPositionInTop10 = getUserPositionInTop10();

    const renderRow = (entry, index, isCurrentUser = false, customRank = null) => {
        const rank = customRank !== null ? customRank : index;
        const isTop3 = rank < 3;
        
        let background;
        if (isTop3) {
            background = rank === 0 
                ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                : rank === 1 
                    ? "linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)"
                    : "linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)";
        } else if (isCurrentUser) {
            background = "linear-gradient(135deg, #806247 0%, #5a4433 100%)";
        } else {
            background = "#f8f9fa";
        }

        const textColor = isTop3 || isCurrentUser ? "white" : "#333";

        return (
            <div
                key={entry.wallet_address}
                style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 100px",
                    padding: "15px",
                    background,
                    borderRadius: "12px",
                    alignItems: "center",
                    color: textColor,
                    border: isCurrentUser && !isTop3 ? "2px solid #806247" : "none",
                }}
            >
                <span style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                }}>
                    {rank < 3 ? (
                        <span style={{ fontSize: "24px" }}>
                            {rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"}
                        </span>
                    ) : (
                        `#${rank + 1}`
                    )}
                </span>
                <span style={{
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: isTop3 || isCurrentUser ? "600" : "400",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}>
                    {truncateAddress(entry.wallet_address)}
                    {isCurrentUser && <span style={{ fontSize: "12px" }}>(You)</span>}
                </span>
                <span style={{
                    textAlign: "right",
                    fontSize: "18px",
                    fontWeight: "bold",
                }}>
                    {entry.total_kills} 🔫
                </span>
            </div>
        );
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#806247",
            padding: "20px",
        }}>
            {/* Header */}
            <div style={{
                maxWidth: "800px",
                margin: "0 auto",
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                }}>
                    <Link
                        to="/"
                        style={{
                            color: "white",
                            textDecoration: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        ← Back to Game
                    </Link>
                </div>

                {/* Leaderboard Card */}
                <div style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "24px",
                    padding: "40px",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }}>
                    <div style={{
                        textAlign: "center",
                        marginBottom: "30px",
                    }}>
                        <div style={{ fontSize: "60px", marginBottom: "10px" }}>🏆</div>
                        <h1 style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: "#333",
                            margin: 0,
                        }}>
                            Global Leaderboard
                        </h1>
                        <p style={{
                            fontSize: "14px",
                            color: "#666",
                            marginTop: "10px",
                        }}>
                            Top 10 players ranked by total kills
                        </p>
                    </div>

                    {loading ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#666",
                        }}>
                            Loading leaderboard...
                        </div>
                    ) : error ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#e74c3c",
                        }}>
                            {error}
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#666",
                        }}>
                            No scores yet. Be the first to play!
                        </div>
                    ) : (
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}>
                            {/* Header Row */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "60px 1fr 100px",
                                padding: "10px 15px",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#999",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                            }}>
                                <span>Rank</span>
                                <span>Wallet</span>
                                <span style={{ textAlign: "right" }}>Kills</span>
                            </div>

                            {/* Top 10 Rows */}
                            {leaderboard.map((entry, index) => {
                                const isCurrentUser = walletAddress && entry.wallet_address === walletAddress;
                                return renderRow(entry, index, isCurrentUser);
                            })}

                            {/* User's position if not in top 10 */}
                            {walletAddress && !isUserInTop10 && myRank && myData && (
                                <>
                                    {/* Separator */}
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "10px 0",
                                    }}>
                                        <div style={{ flex: 1, height: "1px", background: "#ddd" }} />
                                        <span style={{ color: "#999", fontSize: "12px" }}>Your Position</span>
                                        <div style={{ flex: 1, height: "1px", background: "#ddd" }} />
                                    </div>
                                    
                                    {renderRow(myData, myRank - 1, true, myRank - 1)}
                                </>
                            )}

                            {/* No score message if wallet connected but no data */}
                            {walletAddress && !isUserInTop10 && !myData && (
                                <div style={{
                                    textAlign: "center",
                                    padding: "20px",
                                    color: "#666",
                                    fontSize: "14px",
                                    background: "#f8f9fa",
                                    borderRadius: "12px",
                                    marginTop: "10px",
                                }}>
                                    You haven't scored any kills yet. Start playing to get on the leaderboard!
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: "center",
                    marginTop: "30px",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "14px",
                }}>
                    {walletAddress 
                        ? `Connected: ${truncateAddress(walletAddress)}`
                        : "Connect your Solana wallet to save your highscore!"
                    }
                </div>
            </div>
        </div>
    );
};
