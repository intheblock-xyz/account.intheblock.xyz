import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { ICurrencyRate } from "./currency";
import { ILabelsForm, getLabelsForm, cleanLabelsForm, ILabels } from "./label";
import {
  ITransactionRow,
  ITransactionRowForm,
  getTransactionRowForm,
  cleanTransactionRowFormValues,
} from "./row";

export type TTransactionDirection = "pay" | "receive";

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
  rowUuids: string[];
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
    uuid: transaction?.uuid || uuidv4(),
    processedAt: new Date(transaction?.processedAt || Date.now()),
    rowUuids: transaction?.rows.map(({ uuid }) => uuid) || [],
    labelTitles,
    labelTexts,
  };
}

export function cleanTransactionFormValues(
  formData: ITransactionForm,
  rowsFormData?: ITransactionRowForm[],
  transaction?: ITransaction,
): ITransaction {
  const now = Date.now();
  const rows = rowsFormData
    ? rowsFormData.map((rowFormData) =>
        cleanTransactionRowFormValues(
          rowFormData,
          transaction?.rows.find(({ uuid }) => uuid === rowFormData.uuid),
        ),
      )
    : transaction
    ? transaction.rows
    : [];
  return {
    uuid: formData.uuid,
    createdAt: transaction?.createdAt || now,
    editedAt: now,
    processedAt: moment(formData.processedAt).unix() * 1000,
    rows,
    rates: transaction?.rates || [],
    labels: cleanLabelsForm(formData.labelTitles, formData.labelTexts),
  };
}
