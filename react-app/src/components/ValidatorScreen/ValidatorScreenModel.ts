import { ValidatorScreenValidatorFragment } from "../../generated/graphql";

export type Validator = ValidatorScreenValidatorFragment;

export interface PaginatedValidators {
  validators: Validator[];
  totalCount: number;
}
