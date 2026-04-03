import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import HomePage from "./HomePage";
import SceneManager from "./three/SceneManager";
import "./App.css";
export default function App() {
    return (_jsxs("div", { className: "background-wrapper", children: [_jsx(SceneManager, {}), _jsx(HomePage, {})] }));
}
