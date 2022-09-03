import { v4 as uuidv4 } from "uuid";
import { ICurrency } from "../app";
import { ITransaction } from "../transaction";
import {
  getDefaultProjectExchanges,
  getDefaultProjectLabelTitles,
  getDefaultProjectTitle,
  getDefaultProjectTokens,
} from "./preferences";

export interface IProject {
  uuid: string;
  title: string;
  createdAt: number;
  editedAt: number;
  isSignedIn: boolean;
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

export function getNewProject(isSignedIn: boolean): IProjectSerialized {
  const now = Date.now();
  return {
    uuid: uuidv4(),
    title: getDefaultProjectTitle(),
    createdAt: now,
    editedAt: now,
    isSignedIn,
    transactions: [],
    projectLabelTitles: getDefaultProjectLabelTitles(),
    projectTokens: getDefaultProjectTokens(),
    projectExchanges: getDefaultProjectExchanges(),
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
    isSignedIn: projectData.isSignedIn,
    transactions: projectData.transactions,
    projectLabelTitles: Array.from(projectData.projectLabelTitles),
    projectTokens: Array.from(projectData.projectTokens),
    projectExchanges: Array.from(projectData.projectExchanges),
  };
}
