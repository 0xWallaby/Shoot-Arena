import { Html } from "@react-three/drei";
import { useState, useEffect } from "react";

export const MobileRespawnButton = ({ onRespawn }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect mobile device
        const checkMobile = () => {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) || window.innerWidth < 768;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isMobile) return null; // Only show on mobile

    return (
        <Html
            fullscreen
            zIndexRange={[100, 0]}
            style={{
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    position: "fixed",
                    bottom: "20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "10px",
                    pointerEvents: "auto",
                }}
            >
                {/* Respawn Button */}
                <button
                    onTouchStart={(e) => {
                        e.preventDefault();
                        onRespawn();
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        onRespawn();
                    }}
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "3px solid white",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        touchAction: "manipulation",
                        userSelect: "none",
                        WebkitTapHighlightColor: "transparent",
                    }}
                    onTouchEnd={(e) => {
                        e.target.style.transform = "scale(1)";
                    }}
                    onTouchStartCapture={(e) => {
                        e.target.style.transform = "scale(0.95)";
                    }}
                >
                    <div style={{ fontSize: "24px", marginBottom: "2px" }}>🔄</div>
                    <div style={{ fontSize: "11px" }}>RESPAWN</div>
                </button>
            </div>
        </Html>
    );
};