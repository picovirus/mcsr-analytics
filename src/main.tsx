import ReactDOM from "react-dom/client";
import {StrictMode} from "react";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("keydown", (ev) => {
  // Disabling keyboard shortcuts
  ev.preventDefault();

  if (ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
    switch (ev.code) {
      case "KeyR":
        location.reload();
        break;

      default:
        break;
    }
  }
});
