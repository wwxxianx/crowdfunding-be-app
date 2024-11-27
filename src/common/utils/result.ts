// type Result<T> = Success<T> | Failure;

// interface Success<T> {
//   success: true;
//   value: T;
// }

// interface Failure {
//   success: false;
//   error: any;
// }

type Result<T> =
  | {
      data: T;
      error?: string;
    }
  | {
      data: null;
      error: string;
    };