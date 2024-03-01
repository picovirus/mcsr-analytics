import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <App/>
);

document.addEventListener('contextmenu', event => event.preventDefault());
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
