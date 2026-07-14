import type {
  CreateProductInput,
  UpdateProductInput,
} from "../interfaces/Product";

export const validateCreateProduct = (
  input: CreateProductInput,
): string[] => {
  const errors: string[] = [];

  // errors for the name
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    errors.push("name is required");
  } else if (input.name.trim().length > 120) {
    errors.push("name must not exceed 120 characters");
  }

  // errors for price
  if (
    typeof input.price !== "number" ||
    !Number.isFinite(input.price) ||
    input.price < 0
  ) {
    errors.push("price must be a non-negative number");
  }

  // errors for description
  if (
    input.description !== undefined &&
    typeof input.description !== "string"
  ) {
    errors.push("description must be a string");
  } else if (input.description && input.description.length > 1000) {
    errors.push("description must not exceed 1000 characters");
  }

  return errors;
};

export const validateUpdateProduct = (
  input: UpdateProductInput,
): string[] => {
  const errors: string[] = [];
  const hasSupportedField =
    input.name !== undefined ||
    input.price !== undefined ||
    input.description !== undefined;

  if (!hasSupportedField) {
    errors.push("at least one of name, price, or description is required");
  }

  if (input.name !== undefined) {
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      errors.push("name must be a non-empty string");
    } else if (input.name.trim().length > 120) {
      errors.push("name must not exceed 120 characters");
    }
  }

  if (
    input.price !== undefined &&
    (typeof input.price !== "number" ||
      !Number.isFinite(input.price) ||
      input.price < 0)
  ) {
    errors.push("price must be a non-negative number");
  }

  if (
    input.description !== undefined &&
    typeof input.description !== "string"
  ) {
    errors.push("description must be a string");
  } else if (
    input.description !== undefined &&
    input.description.length > 1000
  ) {
    errors.push("description must not exceed 1000 characters");
  }

  return errors;
};
