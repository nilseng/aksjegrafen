import { useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { AppContext } from "../../../App";
import { ICompany, IShareholder } from "../../../models/models";
import { useFinancialsByUnit } from "../../../services/brregService";
import { BalanceSheet } from "./BalanceSheet";
import { ProfitAndLoss } from "./ProfitAndLoss";

interface IProps {
  entity: ICompany | IShareholder;
}

export const Financials = ({ entity }: IProps) => {
  const { theme } = useContext(AppContext);

  const financials = useFinancialsByUnit(entity);

  if (!financials || (financials as any).error) return null;

  return (
    <div className="mb-4">
      <p style={{ color: theme.primary }} className="font-weight-bold">
        Finansielle nøkkeltall fra forrige regnskapsår
      </p>
      {financials?.map((f) => (
        <div key={f.id} style={{ border: `${theme.primary} solid 1px` }} className="rounded p-4">
          <Row>
            <Col>
              <ProfitAndLoss pAndL={f.resultatregnskapResultat} />
            </Col>
            <Col>
              <BalanceSheet assets={f.eiendeler} equityAndDebt={f.egenkapitalGjeld} />
            </Col>
          </Row>
          <div className="text-center">
            <p style={{ color: theme.text }} className="small pt-2 m-0">
              Periode: {new Date(f.regnskapsperiode?.fraDato).toLocaleDateString(navigator?.language)}-
              {new Date(f.regnskapsperiode.tilDato).toLocaleDateString(navigator?.language)}
            </p>
            <p style={{ color: theme.text }} className="small m-0">
              Valuta: {f.valuta}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
