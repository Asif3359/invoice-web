interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-4 text-sm text-rose-200">
      {message ?? "Something went wrong while loading data."}
    </div>
  );
}

