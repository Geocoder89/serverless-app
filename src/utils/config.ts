export const getProductsTableName = (): string => {
  const tableName = process.env.PRODUCTS_TABLE
  if(!tableName) {
    throw new Error("PRODUCTS_TABLE environment variable is not configured")
  }

  return tableName
}