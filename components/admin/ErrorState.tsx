import { StatusAlert } from "@/components/status";

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <StatusAlert tone="failed">
      {message ?? "Something went wrong while loading data."}
    </StatusAlert>
  );
}
