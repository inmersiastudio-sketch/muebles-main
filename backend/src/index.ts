import { env } from "./config/env.js";
import { createServer } from "./server.js";
import { runAutoSeed } from "./utils/autoSeed.js";

const app = createServer();
const port = Number(env.PORT);

// Listen on all network interfaces (0.0.0.0) to allow access from mobile devices
app.listen(port, "0.0.0.0", async () => {
  console.log(`[backend] listening on port ${port}`);
  console.log(`[backend] accessible at http://localhost:${port}`);
  console.log(`[backend] for mobile AR, use your local IP: http://YOUR_LOCAL_IP:${port}`);

  // Auto-seed database if needed (runs once on first start)
  await runAutoSeed();
});
