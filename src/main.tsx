import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import App from "./App";
import CharacterList from "./pages/CharacterList";
import CreateCharacter from "./pages/CreateCharacter";
import CharacterSheet from "./pages/CharacterSheet";
import "./styles/global.css";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <CharacterList /> },
      { path: "create", element: <CreateCharacter /> },
      { path: "edit/:id", element: <CreateCharacter /> },
      { path: "sheet/:id", element: <CharacterSheet /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
