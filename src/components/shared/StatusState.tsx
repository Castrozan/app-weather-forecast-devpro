type StatusStateProps = {
  message: string | null;
};

export const StatusState = ({ message }: StatusStateProps) => {
  if (!message) {
    return null;
  }

  return <p className="status-message">{message}</p>;
};
