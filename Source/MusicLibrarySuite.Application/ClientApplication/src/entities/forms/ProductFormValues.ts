import dayjs, { Dayjs } from "dayjs";
import { IProduct, Product } from "../../api/ApplicationClient";
import { EmptyGuidString } from "../../constants/applicationConstants";
import { getStartOfDayDate } from "../../helpers/dateTimeHelpers";

export default interface ProductFormValues {
  id?: string;
  title: string;
  description?: string;
  disambiguationText?: string;
  releasedOn: Dayjs;
  releasedOnYearOnly: boolean;
  systemEntity: boolean;
  enabled: boolean;
  createdOn?: string;
  updatedOn?: string;
}

export function mapProductFormInitialValues(initialValues?: IProduct): ProductFormValues | undefined {
  const initialFormValues: ProductFormValues | undefined = initialValues
    ? {
        id: initialValues.id,
        title: initialValues.title,
        description: initialValues.description,
        disambiguationText: initialValues.disambiguationText,
        releasedOn: dayjs(initialValues.releasedOn),
        releasedOnYearOnly: initialValues.releasedOnYearOnly,
        systemEntity: initialValues.systemEntity,
        enabled: initialValues.enabled,
        createdOn: initialValues.createdOn?.toLocaleString(),
        updatedOn: initialValues.updatedOn?.toLocaleString(),
      }
    : undefined;

  return initialFormValues;
}

export function mergeProductFormValues(formValues: ProductFormValues, initialValues?: IProduct): Product {
  const id = formValues.id?.trim() ?? EmptyGuidString;

  const releasedOn = getStartOfDayDate(formValues.releasedOn);

  const updatedValues: IProduct = {
    id: id,
    title: formValues.title.trim(),
    description: formValues.description?.trim(),
    disambiguationText: formValues.disambiguationText?.trim(),
    releasedOn: releasedOn,
    releasedOnYearOnly: formValues.releasedOnYearOnly,
    systemEntity: formValues.systemEntity,
    enabled: formValues.enabled,

    productRelationships: [],
  };

  if (!updatedValues.description && updatedValues.description !== undefined) {
    updatedValues.description = undefined;
  }
  if (!updatedValues.disambiguationText && updatedValues.disambiguationText !== undefined) {
    updatedValues.disambiguationText = undefined;
  }

  if (initialValues) {
    updatedValues.id = initialValues.id;

    updatedValues.productRelationships = initialValues.productRelationships;
  }

  return new Product(updatedValues);
}
