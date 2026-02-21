type StatusStateProps = {
  message: string | null;
  isError?: boolean;
  className?: string;
};

export const StatusState = ({ message, isError = false, className }: StatusStateProps) => {
  if (!message) {
    return null;
  }

  if (isError) {
    return (
      <p role="alert" className={`status-message status-message-error ${className ?? ''}`}>
        {message}
      </p>
    );
  }

  return (
    <p aria-live="polite" className={`status-message ${className ?? ''}`}>
      {message}
    </p>
  );
};
