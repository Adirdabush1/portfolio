import React, { useState } from "react";

interface PrivacyNotice13Props {
  onConsentChange?: (consent: boolean) => void;
}

const PrivacyNotice13: React.FC<PrivacyNotice13Props> = ({ onConsentChange }) => {
  const [checked, setChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setChecked(newValue);
    if (onConsentChange) {
      onConsentChange(newValue);
    }
  };

  return (
    <div className="privacy-notice">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <span className="text-sm text-gray-200">
          By using this service, you agree to our{" "}
          <span
            className="text-blue-400 underline cursor-pointer"
            onClick={() => window.open("/privacy.html", "_blank")}
          >
            Privacy Policy
          </span>{" "}
          and consent to receive information.
        </span>
      </label>
    </div>
  );
};

export default PrivacyNotice13;
