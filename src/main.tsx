import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { GameStateProvider } from "./GameStateContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <GameStateProvider>
        <App />
      </GameStateProvider>
    </ChakraProvider>
  </React.StrictMode>
);
