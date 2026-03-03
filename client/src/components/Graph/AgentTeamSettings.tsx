import {
  faBalanceScale,
  faBinoculars,
  faCalculator,
  faChartLine,
  faNewspaper,
  faProjectDiagram,
  faRobot,
  faSearch,
  faTimes,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { Agent } from "../../models/models";
import { toggleAgent, resetAgents } from "../../slices/agentTeamSlice";
import { RootState, useAppDispatch } from "../../store";
import { NeuButton } from "../NeuButton";
import { AppContext } from "../../AppContext";

const iconMap: Record<string, IconDefinition> = {
  "chart-line": faChartLine,
  "project-diagram": faProjectDiagram,
  search: faSearch,
  binoculars: faBinoculars,
  calculator: faCalculator,
  newspaper: faNewspaper,
  "balance-scale": faBalanceScale,
};

export const AgentTeamSettings = () => {
  const dispatch = useAppDispatch();
  const { theme } = useContext(AppContext);
  const agents = useSelector<RootState, Agent[]>((state) => state.agentTeam.agents);
  const [isOpen, setIsOpen] = useState(false);

  const enabledCount = agents.filter((a) => a.enabled).length;

  if (isOpen)
    return (
      <div className="absolute flex left-0 top-0 p-2 z-10">
        <div className="relative glassy rounded-lg w-72 p-5">
          <NeuButton
            className="absolute top-0 right-0 h-5 w-5 p-1 m-1"
            style={{ borderRadius: "100%" }}
            textClassName="text-primary text-xl"
            icon={faTimes}
            action={() => setIsOpen(false)}
          />
          <h2 className="text-primary font-bold text-sm mb-1">Agent-team</h2>
          <p className="text-xs mb-3" style={{ color: theme.muted }}>
            {enabledCount} av {agents.length} agenter aktive
          </p>
          <div className="flex flex-col gap-2">
            {agents.map((agent) => (
              <AgentToggle key={agent.id} agent={agent} onToggle={() => dispatch(toggleAgent(agent.id))} />
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <NeuButton
              icon={faUndo}
              text=" Nullstill"
              className="text-xs px-2 py-1"
              textClassName="text-xs"
              style={{ color: theme.muted }}
              action={() => dispatch(resetAgents())}
            />
          </div>
        </div>
      </div>
    );

  return (
    <div className="absolute flex left-0 top-0 p-2">
      <NeuButton
        icon={faRobot}
        className="text-primary p-2"
        action={() => setIsOpen(true)}
        ariaLabel="Agent-team innstillinger"
      />
    </div>
  );
};

const AgentToggle = ({ agent, onToggle }: { agent: Agent; onToggle: () => void }) => {
  const { theme } = useContext(AppContext);

  return (
    <button
      className="flex items-start gap-2 rounded-lg p-2 text-left w-full transition-opacity"
      style={{
        ...(agent.enabled ? theme.lowering : theme.button),
        opacity: agent.enabled ? 1 : 0.5,
      }}
      onClick={onToggle}
    >
      <div
        className="flex items-center justify-center w-7 h-7 rounded-md mt-0.5 shrink-0"
        style={{ color: agent.enabled ? theme.primary : theme.muted }}
      >
        <FontAwesomeIcon icon={iconMap[agent.icon] ?? faRobot} className="text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold truncate">{agent.name}</span>
          <div
            className="w-3 h-3 rounded-full shrink-0 ml-2 transition-colors"
            style={{
              backgroundColor: agent.enabled ? "#10b981" : theme.muted,
            }}
          />
        </div>
        <p className="text-xs mt-0.5 leading-tight" style={{ color: theme.muted }}>
          {agent.description}
        </p>
      </div>
    </button>
  );
};
