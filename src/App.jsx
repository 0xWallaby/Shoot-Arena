import { Loader, PerformanceMonitor, SoftShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { Suspense, useState, useEffect } from "react";
import { insertCoin } from "playroomkit";
import { Experience } from "./components/Experience";
import { Leaderboard } from "./components/Leaderboard";
import { WeaponSelector } from "./components/WeaponSelector";
import { WalletConnect } from "./components/WalletConnect";

function App() {
  const [downgradedPerformance, setDowngradedPerformance] = useState(false);
  const [walletStep, setWalletStep] = useState("connect"); // "connect" -> "lobby" -> "game"
  const [walletData, setWalletData] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState("AK");

  // Handle wallet connection or skip
  const handleWalletContinue = (data) => {
    setWalletData(data);
    setWalletStep("lobby");

    // Initialize Playroom after wallet step
    initPlayroom();
  };

  // Initialize Playroom - this will show the lobby automatically
  const initPlayroom = async () => {
    try {
      // insertCoin shows Playroom lobby with our custom skin colors
      await insertCoin({
        skipLobby: false,
        avatarColors: [
          "#00b894", // Emerald (Green)
          "#2d3436", // Shadow (Dark Gray)
          "#dfe6e9", // Arctic (White)
          "#00cec9", // Neon (Bright Cyan)
          "#6c5ce7", // Plasma (Blue)
          "#ff6b6b", // Crimson (Red)
          "#4ecdc4", // Ocean (Cyan)
          "#95e1d3", // Forest (Mint)
          "#f9ca24", // Gold (Yellow)
          "#a29bfe", // Violet (Purple)
          "#fd79a8", // Rose (Pink)
          "#fdcb6e", // Sunset (Orange)
        ],
      });

      // After Launch is clicked, start the game
      setGameStarted(true);
    } catch (error) {
      console.error("Error initializing Playroom:", error);
    }
  };

  // Show wallet connection screen first
  if (walletStep === "connect") {
    return <WalletConnect onContinue={handleWalletContinue} />;
  }

  // Show weapon selector during lobby (after wallet step)
  if (walletStep === "lobby" && !gameStarted) {
    return (
      <WeaponSelector
        onWeaponChange={setSelectedWeapon}
      />
    );
  }

  // After Launch clicked, show the game
  const characterData = {
    weapon: selectedWeapon,
    skin: "#4ecdc4", // Will be overridden by Playroom profile color
    playerName: "",
    wallet: walletData, // Include wallet data
  };

  return (
    <>
      <Loader />
      <Leaderboard />
      <Canvas
        shadows
        camera={{ position: [0, 30, 0], fov: 30, near: 2 }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#242424"]} />
        <SoftShadows size={42} />

        <PerformanceMonitor
          onDecline={(fps) => {
            setDowngradedPerformance(true);
          }}
        />
        <Suspense>
          <Physics>
            <Experience
              characterData={characterData}
              downgradedPerformance={downgradedPerformance}
            />
          </Physics>
        </Suspense>
        {!downgradedPerformance && (
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>
    </>
  );
}

export default App;