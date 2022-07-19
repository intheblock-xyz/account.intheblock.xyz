type TLabelsTuple = [string[], string[]];

interface ITransactionLabel {
  title: string;
  text: string;
}

export interface ILabels {
  labels: ITransactionLabel[];
}

export interface ILabelsForm {
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

export function cleanLabelsForm(
  labelTitles: string[],
  labelTexts: string[],
): ITransactionLabel[] {
  return labelTitles.map((title, index) => ({
    title,
    text: labelTexts[index],
  }));
}
