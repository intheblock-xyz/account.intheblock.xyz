import { ICurrency } from "../app";

export interface IProjectPreferences {
  title: string;
  labelTitles: Set<string>;
  tokens: Set<ICurrency>;
  exchanges: Set<ICurrency>;
}
