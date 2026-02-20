type StatusStateProps = {
  message: string | null;
};

export const StatusState = ({ message }: StatusStateProps) => {
  if (!message) {
    return null;
  }

  const isError =
    /unable|failed|unauthorized|not configured|temporarily unavailable|too many|invalid|required|no city/i.test(
      message,
    );

  return <p className={`status-message ${isError ? 'status-message-error' : ''}`}>{message}</p>;
};
