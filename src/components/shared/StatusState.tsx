import { isErrorStatusMessage, isTransientStatusMessage } from '@/lib/statusMessage';

type StatusStateProps = {
  message: string | null;
  className?: string;
};

export const StatusState = ({ message, className }: StatusStateProps) => {
  if (!message || isTransientStatusMessage(message)) {
    return null;
  }

  const isError = isErrorStatusMessage(message);

  return (
    <p className={`status-message ${isError ? 'status-message-error' : ''} ${className ?? ''}`}>
      {message}
    </p>
  );
};
