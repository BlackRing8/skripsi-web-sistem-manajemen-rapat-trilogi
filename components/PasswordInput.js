"use client";

import { useState } from "react";

export default function PasswordInput({ value, onChange, id = "password", placeholder = "Your password" }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-gray-50 border-2 border-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-11"
        autoComplete="current-password"
        aria-describedby={`${id}-toggle`}
      />

      <button
        id={`${id}-toggle`}
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {visible ? (
          /* eye (open) */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322C3.81 7.865 7.94 5 12 5c4.06 0 8.19 2.865 9.964 7.322a1 1 0 010 .356C20.19 18.135 16.06 21 12 21c-4.06 0-8.19-2.865-9.964-7.322a1 1 0 010-.356z"
            />
            <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          /* eye-off (closed) */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10.58 10.58A3 3 0 0113.42 13.42" />
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2.05 12.32C3.89 7.9 7.8 5 12 5c1.17 0 2.29.2 3.33.57" />
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21.95 11.68A10.97 10.97 0 0112 19c-1.2 0-2.37-.17-3.47-.5" />
          </svg>
        )}
      </button>
    </div>
  );
}
