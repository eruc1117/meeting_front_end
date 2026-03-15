import React from "react";

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0f0f11",
          color: "#e8e8ee",
          fontFamily: "sans-serif",
        }}>
          <h2 style={{ color: "#ff8a65" }}>發生錯誤</h2>
          <p style={{ color: "#9898aa" }}>請重新整理頁面，或聯絡系統管理員。</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "16px",
              padding: "8px 24px",
              background: "#7c6af2",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            重新整理
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
