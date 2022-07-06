

export interface IDocumentAndSiteState {
  loading: boolean;
  allData: ItemRender[];
  curentSiteInfor?:any
}
export interface ItemRender {
  Title: string;
  UniqueId: string;
  ServerRelativeUrl: string;
  AbsoluteUrl: string;
  Created: moment.Moment;
  Type: "Site" | "DocLib";
}
