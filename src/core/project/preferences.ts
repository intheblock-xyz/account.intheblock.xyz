import { ICurrency } from "../app";

export interface IProjectPreferences {
  title: string;
  labelTitles: Set<string>;
  tokens: Set<ICurrency>;
  exchanges: Set<ICurrency>;
}

export function getDefaultProjectTitle(): string {
  return "New Project";
}

export function getDefaultProjectLabelTitles(): string[] {
  return ["Label"];
}

export function getDefaultProjectTokens(): ICurrency[] {
  return [
    { ticker: "ADA", name: "Cardano Ada", geckoId: "cardano", precision: 6 },
  ];
}

export function getDefaultProjectExchanges(): ICurrency[] {
  return [{ ticker: "USD", name: "US Dollar", geckoVsId: "usd", precision: 2 }];
}
