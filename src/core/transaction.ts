import moment from "moment";
import { v4 as uuidv4 } from "uuid";

interface ICurrency {
  name?: string;
  ticker: string;
  geckoId?: string;
  geckoVsId?: string;
}

interface ICurrencyRate {
  currency: ICurrency;
  currencyVs: ICurrency;
  value: number;
}

interface ITransactionLabel {
  title: string;
  text: string;
}

type TLabelsTuple = [string[], string[]];

export interface ITransaction {
  uuid: string;
  createdAt: number;
  editedAt: number;
  processedAt: number;
  rows: ITransactionRow[];
  rates: ICurrencyRate[];
  labels: ITransactionLabel[];
}

export interface ITransactionForm {
  readonly uuid: string;
  processedAt: Date;
  labelTitles: string[];
  labelTexts: string[];
}

export type TTransactionDirection = "pay" | "receive";

export interface ITransactionFormSubmit {
  formData: ITransactionForm;
  transaction?: ITransaction;
  transactionDirection?: TTransactionDirection;
}

export interface ITransactionRow {
  uuid: string;
  createdAt: number;
  editedAt: number;
  processedAt: number;
  amount: number;
  currency: ICurrency;
  labels: ITransactionLabel[];
}

export interface ITransactionRowForm {
  readonly uuid: string;
  processedAt: number;
  amount: string;
  amountVs: string;
  currencyTicker: string;
  currencyTickerVs: string;
  rate: string;
  labelTitles: string[];
  labelTexts: string[];
}

export function getTransactionForm(
  projectLabelTitles: Set<string>,
  transaction?: ITransaction,
): ITransactionForm {
  function reduceLabels(acc: TLabelsTuple, title: string): TLabelsTuple {
    const text = transaction?.labels.find(
      (label) => label.title === title,
    )?.text;
    acc[0].push(title);
    acc[1].push(text || "");
    return acc;
  }

  const blankLabelsTuple: TLabelsTuple = [[], []];

  const [labelTitles, labelTexts] =
    Array.from(projectLabelTitles).reduce(reduceLabels, blankLabelsTuple) ||
    blankLabelsTuple;

  return {
    uuid: transaction?.uuid || "",
    processedAt: new Date(transaction?.processedAt || Date.now()),
    labelTitles,
    labelTexts,
  };
}

export function cleanTransactionFormValues(
  formData: ITransactionForm,
  transaction?: ITransaction,
): ITransaction {
  const now = Date.now();
  return {
    uuid: formData.uuid || uuidv4(),
    createdAt: transaction?.createdAt || now,
    editedAt: now,
    processedAt: moment(formData.processedAt).unix() * 1000,
    rows: transaction?.rows || [],
    rates: transaction?.rates || [],
    labels: formData.labelTitles.map((title, index) => ({
      title,
      text: formData.labelTexts[index],
    })),
  };
}
