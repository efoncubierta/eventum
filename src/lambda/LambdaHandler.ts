export type LambdaHandler<Request, Response> = (request: Request) => Promise<Response>;
