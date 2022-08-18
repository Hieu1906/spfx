
import { ChiNhanh } from "../models/ChiNhanh";
import { BaseService } from "./baseService";

export class ChiNhanhService extends BaseService<ChiNhanh> {
  listName = "ChiNhanh";
  site = "";
}

export const chiNhanhService = new ChiNhanhService();
