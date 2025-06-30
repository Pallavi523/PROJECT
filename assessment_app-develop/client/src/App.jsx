import React from "react";
import { RouterProvider } from "react-router-dom";
import RouterComponent from "./routes/Router";

function App() {
  return (
    <div>
      {/* Directly use RouterProvider */}
      <RouterProvider router={RouterComponent} />
    </div>
  );
}

export default App;
