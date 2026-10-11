/** Generic loading / error / empty state renderer */
export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="state-loading">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="state-error">
      <span style={{ fontSize: '1.5rem' }}>⚠️</span>
      <strong>Error</strong>
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ message = 'No data available' }) {
  return (
    <div className="state-empty">
      <span style={{ fontSize: '1.5rem' }}>📭</span>
      <span>{message}</span>
    </div>
  );
}
