import { chain } from "lodash";
import { v4 as uuidv4 } from "uuid";
import {
  localStorageLoad,
  localStorageSave,
  TLocalStorageKey,
} from "@/lib/localStorage";
import { ITransaction } from "./transaction";

export interface IProject {
  uuid: string;
  title: string;
  createdAt: number;
  editedAt: number;
  transactions: ITransaction[];
  projectLabelTitles: Set<string>;
}

export interface IProjectData extends IProject {
  isLoaded: boolean;
  isFormVisible: boolean;
  editingTransaction: ITransaction | null;
}

export interface IProjectPreferences {
  title: string;
  labelTitles: Set<string>;
}

const LS_PROJECT_KEY = "project";
const LS_PROJECTS_UUIDS_KEY = "projectsUuids";

export function getNewProject(): IProject {
  const now = Date.now();
  return {
    uuid: uuidv4(),
    title: "New Project",
    createdAt: now,
    editedAt: now,
    transactions: [
      // {
      //   uuid: uuidv4(),
      //   createdAt: now,
      //   editedAt: now,
      //   processedAt: now,
      //   rows: [
      //     {
      //       uuid: uuidv4(),
      //       createdAt: now,
      //       editedAt: now,
      //       processedAt: now,
      //       amount: 350,
      //       currency: { ticker: "ada" },
      //       labels: [{ title: "Label", text: "TEST LABEL 1.1" }],
      //     },
      //     {
      //       uuid: uuidv4(),
      //       createdAt: now,
      //       editedAt: now,
      //       processedAt: now,
      //       amount: 68.267,
      //       currency: { ticker: "ada" },
      //       labels: [{ title: "Label", text: "TEST LABEL 1.2" }],
      //     },
      //   ],
      //   rates: [
      //     {
      //       currency: { ticker: "ada" },
      //       currencyVs: { ticker: "usd" },
      //       value: 0.5,
      //     },
      //   ],
      //   labels: [{ title: "Label", text: "TEST LABEL 1" }],
      // },
    ],
    projectLabelTitles: new Set<string>(["Label"]),
  };
}

export function serializeProject(projectData: IProjectData): IProject {
  return {
    uuid: projectData.uuid,
    title: projectData.title,
    createdAt: projectData.createdAt,
    editedAt: projectData.editedAt,
    transactions: projectData.transactions,
    projectLabelTitles: projectData.projectLabelTitles,
  };
}

function getProjectKey(uuid: string): TLocalStorageKey {
  return [LS_PROJECT_KEY, uuid];
}

function getSavedProjectsUuids(): string[] {
  return localStorageLoad<string[]>(LS_PROJECTS_UUIDS_KEY) || [];
}

export function saveProject(project: IProject): void {
  const savedProjectsUuids = getSavedProjectsUuids();

  localStorageSave<IProject>(getProjectKey(project.uuid), project);

  if (!savedProjectsUuids.includes(project.uuid)) {
    localStorageSave<string[]>(LS_PROJECTS_UUIDS_KEY, [
      ...savedProjectsUuids,
      project.uuid,
    ]);
  }
}

export function getProjectByUuid(uuid: string): IProject {
  const project = localStorageLoad<IProject>(getProjectKey(uuid));

  if (project === null) {
    throw new Error(`No project with uuid '${uuid}' found in storage`);
  } else {
    return project;
  }
}

export function getLastEditedProject(): IProject | null {
  const savedProjectsUuids = getSavedProjectsUuids();
  if (savedProjectsUuids.length === 0) {
    return null;
  }

  const savedProjects = savedProjectsUuids.map((uuid) =>
    getProjectByUuid(uuid),
  );

  return chain(savedProjects).sortBy("editedAt").last().value();
}
