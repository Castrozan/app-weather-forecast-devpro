type StatusStateProps = {
  message: string | null;
  isError?: boolean;
  className?: string;
};

export const StatusState = ({ message, isError = false, className }: StatusStateProps) => {
  if (!message) {
    return null;
  }

  return (
    <p className={`status-message ${isError ? 'status-message-error' : ''} ${className ?? ''}`}>
      {message}
    </p>
  );
};
