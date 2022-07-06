import { IDataroomSite } from "./../models/IDataroomSite";
import { BaseService } from "./baseService";

export class DataroomSitesService extends BaseService<IDataroomSite> {
  listName = "DataroomSites";
  site = "";
}

export const dataroomSitesService = new DataroomSitesService();
