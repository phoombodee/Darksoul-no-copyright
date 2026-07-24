import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackText?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-950 text-white p-6 rounded-2xl border border-rose-500/30 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-rose-300 mb-1">
            {this.props.fallbackText || 'เกิดข้อผิดพลาดในการแสดงผล (Rendering Error)'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-4 font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-words">
            {this.state.error?.message || 'WebGL Context / Component Error'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>โหลดฉากใหม่ (Reload Scene)</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
