export class ScimFilterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScimFilterError';
  }
}
