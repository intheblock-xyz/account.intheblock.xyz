import { v4 as uuidv4 } from "uuid";
import { ICurrency } from "../currency";
import { ITransaction } from "../transaction";

export interface IProject {
  uuid: string;
  title: string;
  createdAt: number;
  editedAt: number;
  transactions: ITransaction[];
  projectLabelTitles: Set<string>;
  projectTokens: Set<ICurrency>;
  projectExchanges: Set<ICurrency>;
}

export interface IProjectSerialized
  extends Omit<
    IProject,
    "projectLabelTitles" | "projectTokens" | "projectExchanges"
  > {
  projectLabelTitles: string[];
  projectTokens: ICurrency[];
  projectExchanges: ICurrency[];
}

export interface IProjectData extends IProject {
  isLoaded: boolean;
  isFormVisible: boolean;
  editingTransaction: ITransaction | null;
  maxTransactionRowsNum: number;
}

export function getNewProject(): IProjectSerialized {
  const now = Date.now();
  return {
    uuid: uuidv4(),
    title: "New Project",
    createdAt: now,
    editedAt: now,
    transactions: [],
    projectLabelTitles: ["Label"],
    projectTokens: [
      { ticker: "ADA", name: "Cardano Ada", geckoId: "cardano", precision: 6 },
    ],
    projectExchanges: [
      { ticker: "USD", name: "US Dollar", geckoVsId: "usd", precision: 2 },
    ],
  };
}

export function serializeProject(
  projectData: IProjectData,
): IProjectSerialized {
  return {
    uuid: projectData.uuid,
    title: projectData.title,
    createdAt: projectData.createdAt,
    editedAt: projectData.editedAt,
    transactions: projectData.transactions,
    projectLabelTitles: Array.from(projectData.projectLabelTitles),
    projectTokens: Array.from(projectData.projectTokens),
    projectExchanges: Array.from(projectData.projectExchanges),
  };
}
