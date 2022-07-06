import { get } from "lodash";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
export interface QueryOption {
  orderBy?: string;
}
export abstract class BaseService<T> {
  listName: string;
  site: string;

  async getAll(queryOption?: QueryOption) {
    const f = sp.web.lists.getByTitle(this.listName).items.top(5000);
    if (get(queryOption, "orderBy", "") !== "") {
      f.orderBy(queryOption.orderBy, true);
    }
    return (await f.get()) as T[];
  }
}
