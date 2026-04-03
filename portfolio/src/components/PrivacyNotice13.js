import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const PrivacyNotice13 = ({ onConsentChange }) => {
    const [checked, setChecked] = useState(false);
    const handleChange = (e) => {
        const newValue = e.target.checked;
        setChecked(newValue);
        if (onConsentChange) {
            onConsentChange(newValue);
        }
    };
    return (_jsx("div", { className: "privacy-notice", children: _jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: checked, onChange: handleChange, className: "w-4 h-4" }), _jsxs("span", { className: "text-sm text-gray-200", children: ["By using this service, you agree to our", " ", _jsx("span", { className: "text-blue-400 underline cursor-pointer", onClick: () => window.open("/privacy.html", "_blank"), children: "Privacy Policy" }), " ", "and consent to receive information."] })] }) }));
};
export default PrivacyNotice13;
