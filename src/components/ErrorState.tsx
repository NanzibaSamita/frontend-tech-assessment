interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <h2>Unable to load this content</h2>
      <p>{message}</p>
      {onRetry && (
        <button className="primary-button" onClick={onRetry} type="button">
          Try again
        </button>
      )}
    </div>
  );
}
