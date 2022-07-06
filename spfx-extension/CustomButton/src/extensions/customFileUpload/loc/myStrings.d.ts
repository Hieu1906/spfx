declare interface ICustomFileUploadCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'CustomFileUploadCommandSetStrings' {
  const strings: ICustomFileUploadCommandSetStrings;
  export = strings;
}
