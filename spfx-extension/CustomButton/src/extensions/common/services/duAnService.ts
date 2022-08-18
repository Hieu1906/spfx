
import { DuAn } from "../models/DuAn";
import { BaseService } from "./baseService";

export class DuAnService extends BaseService<DuAn> {
  listName = "DuAn";
  site = "";
}

export const duAnService = new DuAnService();
