import { isErrorStatusMessage, isTransientStatusMessage } from '@/lib/statusMessage';

type StatusStateProps = {
  message: string | null;
};

export const StatusState = ({ message }: StatusStateProps) => {
  if (!message || isTransientStatusMessage(message)) {
    return null;
  }

  const isError = isErrorStatusMessage(message);

  return <p className={`status-message ${isError ? 'status-message-error' : ''}`}>{message}</p>;
};
