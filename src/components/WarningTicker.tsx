import React from "react";

export default function WarningTicker() {
  const warnings = [
    "Avoid using Opay bank",
    "Payments made with other banks are confirmed within minutes",
    "Do not dispute your payment under any circumstances",
    "Upload a clear payment screenshot immediately after transfer",
  ];

  // Duplicate warnings for seamless loop
  const tickerContent = [...warnings, ...warnings];

  return (
    <div className="warning-ticker-wrapper">
      <div className="warning-ticker-container">
        <div className="ticker-track">
          {tickerContent.map((warning, index) => (
            <span key={index} className="ticker-item">
              {warning} • 
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .warning-ticker-wrapper {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          margin-bottom: 16px;
        }

        .warning-ticker-container {
          width: 100%;
          overflow: hidden;
          background: linear-gradient(90deg, rgba(251, 191, 36, 0.1), rgba(239, 68, 68, 0.1));
          border-top: 1px solid rgba(251, 191, 36, 0.3);
          border-bottom: 1px solid rgba(251, 191, 36, 0.3);
          padding: 12px 0;
          margin: 0;
        }

        .ticker-track {
          display: flex;
          animation: scroll-left 30s linear infinite;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 500;
        }

        .ticker-item {
          color: #fbbf24;
          display: inline-block;
          padding: 0 12px;
          flex-shrink: 0;
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .ticker-track {
            animation: scroll-left 20s linear infinite;
            font-size: 13px;
          }

          .ticker-item {
            padding: 0 8px;
          }

          .warning-ticker-container {
            padding: 10px 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};
