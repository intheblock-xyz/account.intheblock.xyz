import { chain } from "lodash";
import {
  localStorageLoad,
  localStorageSave,
  TLocalStorageKey,
} from "@/lib/localStorage";

export interface IProject {
  uuid: string;
  title: string;
  createdAt: number;
  editedAt: number;
}

const LS_PROJECT_KEY = "project";
const LS_PROJECTS_UUIDS_KEY = "projectsUuids";

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
