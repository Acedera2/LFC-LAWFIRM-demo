import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

async function findApiTarget() {
  const ports = Array.from({ length: 11 }, (_, index) => 5000 + index);

  for (const port of ports) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) {
        return `http://127.0.0.1:${port}`;
      }
    } catch {
      // try the next port
    }
  }

  return "http://127.0.0.1:5000";
}

export default defineConfig(async () => {
  const apiTarget = await findApiTarget();

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            charts: ["recharts"],
            motion: ["framer-motion"],
            vendor: ["axios", "date-fns", "lucide-react", "react-hot-toast", "clsx"]
          }
        }
      }
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        },
        "/auth": {
          target: apiTarget,
          changeOrigin: true,
          secure: false
        }
      }
    },
    preview: {
      port: 4173
    }
  };
});
