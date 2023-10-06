import { faCheckCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { useBrregEntityInfo } from "../../services/brregService";
import { RootState } from "../../store";

export const UnitInformation = () => {
  const { source } = useSelector<RootState, RootState["modalHandler"]>((state) => state.modalHandler);
  const unit = useBrregEntityInfo(source?.properties.orgnr);
  return (
    <div className="flex flex-col h-full w-full overflow-auto mt-12 px-2 sm:px-8">
      <h1 className="font-bold text-center">{unit?.navn}</h1>
      {unit?.organisasjonsnummer && <code className="text-center text-xs text-muted">{unit?.organisasjonsnummer}</code>}
      {unit?.konkurs && <p className="text-danger font-bold pb-4">Konkurs</p>}
      {unit?.underAvvikling && (
        <section className="flex items-center pb-4">
          <p className="text-xs font-bold pr-2">Under avvikling</p>
          <FontAwesomeIcon icon={faCheckCircle} className="text-warning" />
        </section>
      )}
      {unit?.underAvvikling && (
        <section className="flex items-center pb-4">
          <p className="text-xs font-bold pr-2">Under tvangsavvikling eller tvangsoppløsning</p>
          <FontAwesomeIcon icon={faCheckCircle} className="text-danger" />
        </section>
      )}
      {unit?.slettedato ? (
        <section className="pb-4">
          <p className="text-xs font-bold">Slettes</p>
          <p className="text-sm font-bold text-danger">
            {new Date(unit?.slettedato).toLocaleDateString(navigator.language)}
          </p>
        </section>
      ) : null}
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
          {unit.naeringskode2 && (
            <p className="text-sm pt-1">
              {unit?.naeringskode2?.beskrivelse} (<code className="text-xs">{unit?.naeringskode2.kode}</code>)
            </p>
          )}
          {unit.naeringskode3 && (
            <p className="text-sm pt-1">
              {unit?.naeringskode3?.beskrivelse} (<code className="text-xs">{unit?.naeringskode3.kode}</code>)
            </p>
          )}
        </section>
      )}
      {unit?.antallAnsatte ? (
        <section className="pb-4">
          <p className="text-xs font-bold">Antall ansatte</p>
          <p className="text-sm">{unit?.antallAnsatte.toLocaleString()}</p>
        </section>
      ) : null}
      {unit?.stiftelsesdato ? (
        <section className="pb-4">
          <p className="text-xs font-bold">Stiftet</p>
          <p className="text-sm">{new Date(unit?.stiftelsesdato).toLocaleDateString(navigator.language)}</p>
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
      {unit?.registrertIMvaregisteret && (
        <section className="flex items-center pb-4">
          <p className="text-xs font-bold pr-2">Registrert i MVA-registeret</p>
          <FontAwesomeIcon icon={faCheckCircle} className="text-primary" />
        </section>
      )}
    </div>
  );
};
