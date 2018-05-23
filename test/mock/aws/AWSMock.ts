import { AWSDynamoDBMock } from "./dynamodb";

/**
 * Mock AWS API.
 */
export class AWSMock {
  /**
   * Enable the AWS mockup.
   */
  public static enableMock(): void {
    AWSDynamoDBMock.enableMock();
  }

  /**
   * Restore AWS mockup back to normal.
   */
  public static restoreMock(): void {
    AWSDynamoDBMock.restoreMock();
  }
}
