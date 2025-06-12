const heartbeat = (ws) => {
  ws.isAlive = true;
  ws.lastPing = Date.now();
};

const cleanupConnection = (ws, reason = "unknown") => {
  try {
    if (ws.readyState === ws.OPEN) {
      ws.close(1000, reason);
    }
  } catch (error) {
    console.error("Error during connection cleanup:", error);
  }
};

const safeSend = (ws, data) => {
  try {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

const setupHeartbeat = (wss) => {
  const heartbeatInterval = setInterval(() => {
    const now = Date.now();
    wss.clients.forEach((ws) => {
      try {
        if (ws.lastPing && now - ws.lastPing > 60000) {
          console.log(
            `Terminating stale connection: ${ws.connectionId || "unknown"}`,
          );
          ws.terminate();
          return;
        }

        if (ws.isAlive === false) {
          console.log(
            `Terminating dead connection: ${ws.connectionId || "unknown"}`,
          );
          ws.terminate();
          return;
        }

        ws.isAlive = false;
        ws.ping((error) => {
          if (error) {
            console.error(`Ping error for ${ws.connectionId}:`, error);
          }
        });
      } catch (error) {
        console.error("Heartbeat error:", error);
        try {
          ws.terminate();
        } catch (termError) {
          console.error("Error terminating connection:", termError);
        }
      }
    });
  }, 30000);

  return heartbeatInterval;
};

export { heartbeat, cleanupConnection, safeSend, setupHeartbeat };
