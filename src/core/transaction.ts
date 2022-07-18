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
  transaction?: ITransaction,
): ITransactionForm {
  const [labelTitles, labelTexts] = transaction?.labels.reduce(
    (acc, cur) => {
      acc[0].push(cur.title);
      acc[1].push(cur.text);
      return acc;
    },
    [[], []] as [string[], string[]],
  ) || [[], []];

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
    editedAt: transaction?.editedAt || now,
    processedAt: moment(formData.processedAt).unix() * 1000,
    rows: transaction?.rows || [],
    rates: transaction?.rates || [],
    labels: transaction?.labels || [],
  };
}
