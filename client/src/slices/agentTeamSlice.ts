import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Agent, AgentId } from "../models/models";

export interface AgentTeamState {
  agents: Agent[];
}

const defaultAgents: Agent[] = [
  {
    id: AgentId.CompanyAnalyst,
    name: "Selskapsanalytiker",
    description: "Dypdykk i regnskapstall, nøkkeltall og trender for norske selskaper",
    icon: "chart-line",
    enabled: true,
  },
  {
    id: AgentId.NetworkDetective,
    name: "Nettverksdetektiv",
    description: "Avdekker skjulte eierkjeder, krysseierskap og reelle rettighetshavere",
    icon: "project-diagram",
    enabled: true,
  },
  {
    id: AgentId.DueDiligence,
    name: "Due Diligence",
    description: "Bakgrunnssjekk, risikoscoring og compliance-vurdering av selskaper",
    icon: "search",
    enabled: true,
  },
  {
    id: AgentId.MarketMonitor,
    name: "Markedsovervåker",
    description: "Bransjetrender, konkurranseanalyse og markedsposisjonering",
    icon: "binoculars",
    enabled: false,
  },
  {
    id: AgentId.FinancialAuditor,
    name: "Regnskapsrevisor",
    description: "Anomalideteksjon, avviksanalyse og røde flagg i regnskaper",
    icon: "calculator",
    enabled: false,
  },
  {
    id: AgentId.NewsAgent,
    name: "Nyhetsagent",
    description: "Sanntids nyhetsovervåking, sentimentanalyse og mediedekning",
    icon: "newspaper",
    enabled: false,
  },
  {
    id: AgentId.RegulatoryAgent,
    name: "Regelverksagent",
    description: "Overvåking av regulatoriske endringer, frister og etterlevelse",
    icon: "balance-scale",
    enabled: false,
  },
];

const loadAgents = (): Agent[] => {
  try {
    const stored = localStorage.getItem("agentTeam");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return defaultAgents;
};

const initialState: AgentTeamState = {
  agents: loadAgents(),
};

export const agentTeamSlice = createSlice({
  name: "agentTeam",
  initialState,
  reducers: {
    toggleAgent: (state, action: PayloadAction<string>) => {
      const agent = state.agents.find((a) => a.id === action.payload);
      if (agent) {
        agent.enabled = !agent.enabled;
        localStorage.setItem("agentTeam", JSON.stringify(state.agents));
      }
    },
    resetAgents: (state) => {
      state.agents = defaultAgents;
      localStorage.setItem("agentTeam", JSON.stringify(defaultAgents));
    },
  },
});

export const { toggleAgent, resetAgents } = agentTeamSlice.actions;
