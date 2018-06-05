export interface StoreBatchResponse<T> {
  succeededItems?: T[];
  failedItems?: T[];
}
