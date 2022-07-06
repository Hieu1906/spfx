
import * as moment from "moment";

export interface ISideNavState {
  dataSource: {
    Icon?: JSX.Element;
    Title?: string;
    Url?: string;
    TreeData?: ITreeItem[];
  }[];
  treeData?: ITreeItem[];
  loading: boolean;
  activeKey?: string;
  seletedKey?: string[];
  visiblePopover?: boolean;
  expandKeys: string[];
  isResizing: boolean;
  isSearched: boolean;
  valueSearch: string;
}

export interface ITreeItem {
  TypeNode: "DocLib" | "Site" | "Folder";
  children: ITreeItem[];
  RelativeUrl: string;
  AbsoluteUrl?: string;
  Created: moment.Moment;
  UniqueId: string;
  ParentId: string;
  Title: string;
  IsLeaf?: boolean;
}

export interface IAddDocState {
  visible: boolean;
  spining: boolean;
  parentNode?: ITreeItem;
  nameDocLib?: string;
}

export interface IPermissionState {
  visible: boolean;
  spining: boolean;
}

export interface IAddFolderByExcelState {
  visible: boolean;
  spining: boolean;
  dataSource: DataSourceTable[];
  loadingTable?: boolean;
  treeData?: any[];
  parentNode?: ITreeItem;
  searchText?:string;
  filterDropdownVisible:boolean;
  filtered:boolean
}

export interface DataSourceTable {
  NameFolder: string;
  Description: string;
  Code: string;
  ParentCode: string;
}
