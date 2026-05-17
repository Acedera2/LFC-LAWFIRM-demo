import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4200,
              style: {
                borderRadius: "8px",
                border: "1px solid rgba(16,24,32,0.1)",
                boxShadow: "0 16px 40px rgba(16,24,32,0.14)"
              }
            }}
          />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
