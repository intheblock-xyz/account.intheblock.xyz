import { ICurrency } from "../currency";

export interface IProjectPreferences {
  title: string;
  labelTitles: Set<string>;
  tokens: Set<ICurrency>;
  exchanges: Set<ICurrency>;
}
