import React from "react";

interface ImportantPaymentNoticeProps {
  onConfirm: () => void;
  onClose: () => void;
}

const ImportantPaymentNotice: React.FC<ImportantPaymentNoticeProps> = ({
  onConfirm,
  onClose,
}) => {
  return (
    <div className="overlay">
      <div className="modal">
        <button className="close" onClick={onClose}>
          ×
        </button>

        <div className="header">
          <span className="icon warning">⚠️</span>
          <h2>Important Payment Notice</h2>
        </div>

        <ul className="instructions">
          <li>
            Transfer the <strong>exact amount</strong> shown on this page.
          </li>
          <li>
            Upload a clear <strong>payment screenshot</strong> immediately after
            transfer.
          </li>
        </ul>

        <div className="card warning-card">
          <span className="icon">⚠️</span>
          <p>
            <strong>Avoid using Opay bank.</strong> Due to temporary network
            issues from Opay servers, payments made with Opay may not be
            confirmed. Please use <strong>any other Nigerian bank</strong> for
            instant confirmation.
          </p>
        </div>

        <div className="card success-card">
          <span className="icon">✔</span>
          <p>Payments made with other banks are confirmed within minutes.</p>
        </div>

        <div className="card danger-card">
          <span className="icon">✖</span>
          <p>
            Do not dispute your payment under any circumstances — disputes delay
            confirmation.
          </p>
        </div>

        <button className="confirm-btn" onClick={onConfirm}>
          I Understand
        </button>
      </div>

      {/* CSS */}
      <style jsx>{`
        * {
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 50;
        }

        .modal {
          width: 100%;
          max-width: 420px;
          background: linear-gradient(180deg, #0f172a, #020617);
          border-radius: 14px;
          padding: 20px;
          color: #e5e7eb;
          position: relative;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
        }

        .close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: transparent;
          border: none;
          color: #9ca3af;
          font-size: 22px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close:hover {
          color: #ffffff;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .header h2 {
          font-size: 18px;
          font-weight: 600;
        }

        .icon.warning {
          color: #fbbf24;
          font-size: 20px;
        }

        .instructions {
          list-style: none;
          padding: 0;
          margin: 0 0 16px 0;
        }

        .instructions li {
          font-size: 14px;
          color: #d1d5db;
          margin-bottom: 8px;
        }

        .instructions strong {
          color: #ffffff;
        }

        .card {
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 12px;
          display: flex;
          gap: 10px;
          font-size: 13.5px;
          line-height: 1.45;
        }

        .card .icon {
          margin-top: 2px;
          font-size: 16px;
          flex-shrink: 0;
        }

        .warning-card {
          background: linear-gradient(180deg, #2a1f07, #1f1705);
          border: 1px solid #fbbf24;
          color: #fde68a;
        }

        .warning-card strong {
          color: #fde047;
        }

        .success-card {
          background: linear-gradient(180deg, #052e1b, #022013);
          border: 1px solid #22c55e;
          color: #bbf7d0;
        }

        .danger-card {
          background: linear-gradient(180deg, #2a0a0a, #1f0606);
          border: 1px solid #ef4444;
          color: #fecaca;
        }

        .confirm-btn {
          margin-top: 8px;
          width: 100%;
          padding: 14px;
          border-radius: 999px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          color: #020617;
          background: linear-gradient(90deg, #22c55e, #3b82f6);
          transition: transform 0.2s;
        }

        .confirm-btn:active {
          transform: scale(0.98);
        }

        .confirm-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default ImportantPaymentNotice;
