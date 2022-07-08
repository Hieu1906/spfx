
import { ChiNhanh } from "../models/ChiNhanh";
import { BaseService } from "./baseService";

export class ChiNhanhService extends BaseService<ChiNhanh> {
  listName = "Chi Nhánh";
  site = "";
}

export const chiNhanhService = new ChiNhanhService();
