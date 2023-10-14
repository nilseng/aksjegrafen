export const FallbackError = ({ msg }: { msg?: string }) => {
  return (
    <div className="h-full w-full flex justify-center items-center text-primary">
      {msg ?? "Beklager, noe gikk galt! 😬 Teodor har fått beskjed og kommer til å fikse det."}
    </div>
  );
};
