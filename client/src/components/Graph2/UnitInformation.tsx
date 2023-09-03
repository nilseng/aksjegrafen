import { useSelector } from "react-redux";
import { useBrregEntityInfo } from "../../services/brregService";
import { RootState } from "../../store";

export const UnitInformation = () => {
  const { source } = useSelector<RootState, RootState["modalHandler"]>((state) => state.modalHandler);
  const unit = useBrregEntityInfo(source?.properties.orgnr);
  return (
    <div className="flex flex-col h-full w-full overflow-auto mt-12 px-2">
      <h1 className="font-bold text-center">{unit?.navn}</h1>
      {unit?.konkurs && <p className="text-danger">Konkurs</p>}
      {unit?.organisasjonsnummer && <code className="text-center text-xs text-muted">{unit?.organisasjonsnummer}</code>}
      {unit?.hjemmeside && (
        <code className="text-center text-xs font-bold text-primary pb-4">
          <a
            href={/^https?:\/\//.test(unit.hjemmeside) ? unit?.hjemmeside : `https://${unit.hjemmeside}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {unit?.hjemmeside}
          </a>
        </code>
      )}
      {unit?.naeringskode1 && (
        <section className="pb-4">
          <p className="text-xs font-bold">Næring</p>
          <p className="text-sm">
            {unit?.naeringskode1?.beskrivelse} (<code className="text-xs">{unit?.naeringskode1.kode}</code>)
          </p>
        </section>
      )}
      {unit?.antallAnsatte ? (
        <section className="pb-4">
          <p className="text-xs font-bold">Antall ansatte</p>
          <p className="text-sm">{unit?.antallAnsatte.toLocaleString()}</p>
        </section>
      ) : null}
      {unit?.forretningsadresse && (
        <section className="pb-4">
          <p className="text-xs font-bold">Forretningsadresse</p>
          <p className="text-sm">{unit?.forretningsadresse.adresse}</p>
          <p className="text-sm">
            {unit?.forretningsadresse.postnummer} {unit?.forretningsadresse.poststed}
          </p>
        </section>
      )}
      {unit?.postadresse && (
        <section className="pb-4">
          <p className="text-xs font-bold">Postadresse</p>
          <p className="text-sm">{unit?.postadresse.adresse}</p>
          <p className="text-sm">
            {unit?.postadresse.postnummer} {unit?.postadresse.poststed}
          </p>
        </section>
      )}
    </div>
  );
};
