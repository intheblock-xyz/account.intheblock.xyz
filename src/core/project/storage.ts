import { chain } from "lodash";
import {
  TLocalStorageKey,
  localStorageLoad,
  localStorageSave,
} from "@/lib/localStorage";
import { IProjectSerialized } from ".";

const LS_PROJECT_KEY = "project";
const LS_PROJECTS_UUIDS_KEY = "projectsUuids";

function getProjectKey(uuid: string): TLocalStorageKey {
  return [LS_PROJECT_KEY, uuid];
}

function getSavedProjectsUuids(): string[] {
  return localStorageLoad<string[]>(LS_PROJECTS_UUIDS_KEY) || [];
}

export function saveProject(project: IProjectSerialized): void {
  const savedProjectsUuids = getSavedProjectsUuids();

  localStorageSave<IProjectSerialized>(getProjectKey(project.uuid), project);

  if (!savedProjectsUuids.includes(project.uuid)) {
    localStorageSave<string[]>(LS_PROJECTS_UUIDS_KEY, [
      ...savedProjectsUuids,
      project.uuid,
    ]);
  }
}

export function getProjectByUuid(uuid: string): IProjectSerialized {
  const project = localStorageLoad<IProjectSerialized>(getProjectKey(uuid));

  if (project === null) {
    throw new Error(`No project with uuid '${uuid}' found in storage`);
  } else {
    return project;
  }
}

export function getLastEditedProject(): IProjectSerialized | null {
  const savedProjectsUuids = getSavedProjectsUuids();
  if (savedProjectsUuids.length === 0) {
    return null;
  }

  const savedProjects = savedProjectsUuids.map((uuid) =>
    getProjectByUuid(uuid),
  );

  return chain(savedProjects).sortBy("editedAt").last().value();
}
