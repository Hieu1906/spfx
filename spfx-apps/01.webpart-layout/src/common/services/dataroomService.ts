import { IDataroom } from "./../models/IDataroom";
import { BaseService } from "./baseService";

export class DataroomService extends BaseService<IDataroom> {
  listName = "Dataroom";
  site = "";
}

export const dataroomService = new DataroomService();
