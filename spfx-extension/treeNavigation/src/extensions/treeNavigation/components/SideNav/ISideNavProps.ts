import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";



export interface ISideNavProps {
  context: ApplicationCustomizerContext;
}
export interface IAddDocProps  {
  context: ApplicationCustomizerContext;
  updateNode: (parentNode) => Promise<void>;
}

export interface IPermissionProps {
  context: ApplicationCustomizerContext;
}

export interface IAddFolderByExcelProps {
  context: ApplicationCustomizerContext;
  updateNode: (parentNode) => Promise<void>;
}
