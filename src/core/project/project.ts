import { v4 as uuidv4 } from "uuid";
import { ITransaction } from "../transaction";

export interface IProject {
  uuid: string;
  title: string;
  createdAt: number;
  editedAt: number;
  transactions: ITransaction[];
  projectLabelTitles: Set<string>;
}

export interface IProjectSerialized
  extends Omit<IProject, "projectLabelTitles"> {
  projectLabelTitles: string[];
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
  };
}
