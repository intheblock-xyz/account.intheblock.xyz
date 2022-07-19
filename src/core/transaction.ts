import moment from "moment";
import { v4 as uuidv4 } from "uuid";

/* Common */
export type TTransactionDirection = "pay" | "receive";

/* Currencies */
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

/* Labels */
type TLabelsTuple = [string[], string[]];

interface ITransactionLabel {
  title: string;
  text: string;
}

interface ILabels {
  labels: ITransactionLabel[];
}

interface ILabelsForm {
  labelTitles: string[];
  labelTexts: string[];
}

export function getLabelsForm(
  projectLabelTitles: Set<string>,
  labeledItem?: ILabels,
): TLabelsTuple {
  function reduceLabels(acc: TLabelsTuple, title: string): TLabelsTuple {
    const text = labeledItem?.labels.find(
      (label) => label.title === title,
    )?.text;
    acc[0].push(title);
    acc[1].push(text || "");
    return acc;
  }

  const blankLabelsTuple: TLabelsTuple = [[], []];

  return (
    Array.from(projectLabelTitles).reduce(reduceLabels, blankLabelsTuple) ||
    blankLabelsTuple
  );
}

function cleanLabelsForm(
  labelTitles: string[],
  labelTexts: string[],
): ITransactionLabel[] {
  return labelTitles.map((title, index) => ({
    title,
    text: labelTexts[index],
  }));
}

/* Transaction */
export interface ITransaction extends ILabels {
  uuid: string;
  createdAt: number;
  editedAt: number;
  processedAt: number;
  rows: ITransactionRow[];
  rates: ICurrencyRate[];
}

export interface ITransactionForm extends ILabelsForm {
  readonly uuid: string;
  processedAt: Date;
  rows: ITransactionRowForm[];
}

export interface ITransactionFormSubmit {
  formData: ITransactionForm;
  transaction?: ITransaction;
  transactionDirection?: TTransactionDirection;
}

export function getTransactionForm(
  projectLabelTitles: Set<string>,
  transaction?: ITransaction,
): ITransactionForm {
  const [labelTitles, labelTexts] = getLabelsForm(
    projectLabelTitles,
    transaction,
  );
  return {
    uuid: transaction?.uuid || "",
    processedAt: new Date(transaction?.processedAt || Date.now()),
    rows: transaction?.rows.map((row) =>
      getTransactionRowForm(projectLabelTitles, row),
    ) || [getTransactionRowForm(projectLabelTitles)],
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
    uuid: transaction?.uuid || uuidv4(),
    createdAt: transaction?.createdAt || now,
    editedAt: now,
    processedAt: moment(formData.processedAt).unix() * 1000,
    rows: formData.rows.map((rowFormData) =>
      cleanTransactionRowFormValues(
        rowFormData,
        transaction?.rows.find(({ uuid }) => uuid === rowFormData.uuid),
      ),
    ),
    rates: transaction?.rates || [],
    labels: cleanLabelsForm(formData.labelTitles, formData.labelTexts),
  };
}

/* Transaction Row */
export interface ITransactionRow extends ILabels {
  uuid: string;
  createdAt: number;
  editedAt: number;
  processedAt: number;
  amount: number;
  currency: ICurrency;
  currencyVs: ICurrency;
}

export interface ITransactionRowForm extends ILabelsForm {
  readonly uuid: string;
  processedAt: Date;
  amount: string;
  amountVs: string;
  currencyTicker: string;
  currencyTickerVs: string;
  rate: string;
}

export interface ITransactionRowFormSubmit {
  formData: ITransactionRowForm;
  transactionRow?: ITransactionRow;
}

export function getTransactionRowForm(
  projectLabelTitles: Set<string>,
  transactionRow?: ITransactionRow,
): ITransactionRowForm {
  const [labelTitles, labelTexts] = getLabelsForm(
    projectLabelTitles,
    transactionRow,
  );
  return {
    uuid: transactionRow?.uuid || "",
    processedAt: new Date(transactionRow?.processedAt || Date.now()),
    amount: "",
    amountVs: "",
    currencyTicker: "",
    currencyTickerVs: "",
    rate: "",
    labelTitles,
    labelTexts,
  };
}

export function cleanTransactionRowFormValues(
  formData: ITransactionRowForm,
  transactionRow?: ITransactionRow,
): ITransactionRow {
  const now = Date.now();
  return {
    uuid: transactionRow?.uuid || uuidv4(),
    createdAt: transactionRow?.createdAt || now,
    editedAt: now,
    processedAt: moment(formData.processedAt).unix() * 1000,
    amount: 0,
    currency: { ticker: formData.currencyTicker },
    currencyVs: { ticker: formData.currencyTickerVs },
    labels: cleanLabelsForm(formData.labelTitles, formData.labelTexts),
  };
}
