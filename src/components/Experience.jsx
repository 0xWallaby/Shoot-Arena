import { Environment } from "@react-three/drei";
import {
  Joystick,
  isHost,
  myPlayer,
  onPlayerJoin,
  useMultiplayerState,
} from "playroomkit";
import { useEffect, useState, useRef, useCallback } from "react";
import { Bullet } from "./Bullet.jsx";
import { BulletHit } from "./BulletHit.jsx";
import { CharacterController } from "./CharacterController.jsx";
import { Map } from "./Map.jsx";
import { saveHighscore } from "../lib/supabase.js";

export const Experience = ({ characterData, downgradedPerformance = false }) => {
  const [players, setPlayers] = useState([]);
  const lastSavedKills = useRef(0);
  const saveTimeoutRef = useRef(null);

  // Get wallet info from characterData
  const walletConnected = characterData?.wallet?.connected;
  const walletAddress = characterData?.wallet?.address;

  // Debounced save to Supabase (saves after 2 seconds of no new kills)
  const saveKillsToSupabase = useCallback((kills) => {
    if (!walletConnected || !walletAddress) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save after 2 seconds of no new kills
    saveTimeoutRef.current = setTimeout(async () => {
      if (kills > lastSavedKills.current) {
        const result = await saveHighscore(walletAddress, kills);
        if (result.success) {
          lastSavedKills.current = kills;
          if (result.isNewHighscore) {
            console.log(`New highscore saved: ${kills} kills`);
          }
        }
      }
    }, 2000);
  }, [walletConnected, walletAddress]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Track if player join handler is set up
  const playerJoinSetup = useRef(false);
  
  useEffect(() => {
    // Prevent double setup in React strict mode
    if (playerJoinSetup.current) return;
    playerJoinSetup.current = true;
    
    // insertCoin is already called in App.jsx
    // Just set up player join handlers

    onPlayerJoin((state) => {
      // Check if mobile device (touch screen or narrow viewport)
      const isMobile = window.innerWidth < 1024 || 'ontouchstart' in window;
      
      // Joystick will only create UI for current player (myPlayer) on mobile
      const joystick = new Joystick(state, {
        type: "angular",
        buttons: [{ id: "fire", label: "Fire" }],
        // Hide joystick on desktop
        hidden: !isMobile,
      });

      const newPlayer = { state, joystick };
      state.setState("health", 100);
      state.setState("deaths", 0);
      state.setState("kills", 0);

      // Set character data from weapon selector
      if (state.id === myPlayer()?.id && characterData) {
        // For current player, set weapon from selector
        state.setState("character", {
          weapon: characterData.weapon,
          skin: state.getState("profile")?.color || "#4ecdc4", // Use Playroom color picker
        });
      } else {
        // For other players, ensure they have character data
        if (!state.getState("character")) {
          state.setState("character", {
            weapon: "AK", // Default weapon
            skin: state.getState("profile")?.color || "#4ecdc4",
          });
        }
      }

      // Prevent duplicate players
      setPlayers((players) => {
        if (players.some(p => p.state.id === state.id)) {
          return players; // Player already exists
        }
        return [...players, newPlayer];
      });

      state.onQuit(() => {
        setPlayers((players) => players.filter((p) => p.state.id !== state.id));
      });
    });
  }, [characterData]);

  const [bullets, setBullets] = useState([]);
  const [hits, setHits] = useState([]);
  const firedBulletIds = useRef(new Set()); // Track bullets we've already fired

  // Network state for syncing bullets and hits  
  const [networkBullets, setNetworkBullets] = useMultiplayerState("bullets", []);
  const [networkHits, setNetworkHits] = useMultiplayerState("hits", []);

  // Fire a bullet - host-authority model with client-side prediction
  const onFire = useCallback((bullet) => {
    // Prevent duplicate fires (same bullet ID)
    if (firedBulletIds.current.has(bullet.id)) {
      return;
    }
    firedBulletIds.current.add(bullet.id);
    
    // Clean up old IDs (keep last 50)
    if (firedBulletIds.current.size > 100) {
      const ids = Array.from(firedBulletIds.current);
      firedBulletIds.current = new Set(ids.slice(-50));
    }

    // ALWAYS add to local state immediately for instant visual feedback
    setBullets((current) => [...current, bullet]);

    if (!isHost()) {
      // Non-host: store bullet request on player state for host to pick up for physics
      const player = myPlayer();
      if (player) {
        const pending = player.getState("pendingBullet");
        // Only set if no pending bullet (avoid overwriting)
        if (!pending) {
          player.setState("pendingBullet", bullet);
        }
      }
    }
  }, []);

  // Host polls for pending bullets from other players
  useEffect(() => {
    if (!isHost()) return;
    
    const pollInterval = setInterval(() => {
      players.forEach(({ state: playerState }) => {
        const bullet = playerState.getState("pendingBullet");
        if (bullet && bullet.id && !firedBulletIds.current.has(bullet.id)) {
          firedBulletIds.current.add(bullet.id);
          setBullets((current) => [...current, bullet]);
          playerState.setState("pendingBullet", null);
        }
      });
    }, 30); // Poll every 30ms for responsiveness
    
    return () => clearInterval(pollInterval);
  }, [players]);

  const onHit = useCallback((bulletId, position) => {
    if (isHost()) {
      setBullets((current) => current.filter((b) => b.id !== bulletId));
      setHits((current) => [...current, { id: bulletId, position }]);
    }
  }, []);

  const onHitEnded = useCallback((hitId) => {
    if (isHost()) {
      setHits((current) => current.filter((h) => h.id !== hitId));
    }
  }, []);

  // Host syncs bullets and hits to network for other players to see
  useEffect(() => {
    if (isHost()) {
      setNetworkBullets(bullets);
    }
  }, [bullets]);

  useEffect(() => {
    if (isHost()) {
      setNetworkHits(hits);
    }
  }, [hits]);

  // Non-host receives bullets and hits from network for rendering only
  useEffect(() => {
    if (!isHost()) {
      // Merge network bullets with local bullets that might not be in network yet (prediction)
      setBullets((current) => {
        const network = networkBullets || [];
        const myId = myPlayer()?.id;
        
        // Find local bullets that I fired but aren't in network yet
        const localPending = current.filter(b => 
          b.player === myId && // It's my bullet
          !network.some(nb => nb.id === b.id) // Not in network yet
        );
        
        return [...network, ...localPending];
      });
    }
  }, [networkBullets]);

  useEffect(() => {
    if (!isHost()) {
      setHits(networkHits || []);
    }
  }, [networkHits]);

  const onKilled = (_victim, killer) => {
    const killerPlayer = players.find((p) => p.state.id === killer);
    if (killerPlayer) {
      // Use getState to properly read the current kill count
      const currentKills = killerPlayer.state.getState("kills") || 0;
      const newKills = currentKills + 1;
      killerPlayer.state.setState("kills", newKills);

      console.log(`Kill registered! ${killer} now has ${newKills} kills`);

      // Save to Supabase if the killer is the current player with connected wallet
      if (killer === myPlayer()?.id && walletConnected) {
        saveKillsToSupabase(newKills);
      }
    } else {
      console.warn(`Could not find killer with id: ${killer}`);
    }
  };

  return (
    <>
      <Map />
      {players.map(({ state, joystick }) => (
        <CharacterController
          key={state.id}
          state={state}
          userPlayer={state.id === myPlayer()?.id}
          joystick={joystick}
          onKilled={onKilled}
          onFire={onFire}
          downgradedPerformance={downgradedPerformance}
          weapon={state.state.character?.weapon || "AK"}
        />
      ))}
      {bullets.map((bullet) => (
        <Bullet
          key={bullet.id}
          {...bullet}
          onHit={(position) => onHit(bullet.id, position)}
        />
      ))}
      {hits.map((hit) => (
        <BulletHit key={hit.id} {...hit} onEnded={() => onHitEnded(hit.id)} />
      ))}
      <Environment preset="sunset" />
    </>
  );
};