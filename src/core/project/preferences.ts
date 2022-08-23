export interface IProjectPreferences {
  title: string;
  labelTitles: Set<string>;
}

// ------------------------------------------------

interface ILabel {
  uuid: string;
  title: string;
}

interface ILabelForm {
  readonly uuid: string;
  title: string;
}

interface ILabelFormSet {
  labels: ILabelForm[];
}

interface IProjectPreferencesForm {
  title: string;
}

interface IPreferencesGeneral {
  title: string;
  labels: Set<string>;
}

interface IPreferencesGeneralFormData {
  title: string;
  labels: string[];
}

function getPreferencesGeneralFormData(
  preferencesGeneral?: IPreferencesGeneral,
): IPreferencesGeneralFormData {
  return {
    title: preferencesGeneral?.title || "",
    labels: preferencesGeneral ? Array.from(preferencesGeneral.labels) : [],
  };
}

// function normalizePreferencesGeneralFormData