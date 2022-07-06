import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import { ITreeItem } from "./ISideNavState";
import * as moment from "moment";

export class SideNavController {
  private defaultFolders = [
    "_private",
    "SitePages",
    "_catalogs",
    "_vti_pvt",
    "_cts",
    "Lists",
    "Style Library",
    "images",
    "Site Assets",
    "Form",
    "Forms",
    "SiteAssets",
   
  ];

  private defaultList = [
    "appdata",
    "appfiles",
    "Composed Looks",
    "Events",
    "List Template Gallery",
    "Master Page Gallery",
    "Site Assets",
    "Site Pages",
    "Solution Gallery",
    "Style Library",
    "TaxonomyHiddenList",
    "Theme Gallery",
    "User Information List",
    "Web Part Gallery",
    "Documents"
   
  ];

  // lấy dữ liệu từ param
  public getParameterByName = (name: string, url?: string): string => {
    if (!url) url = location.search;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(url);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  //lấy ra các doclib từ thông tin site truyền vào
  public async getFolderorDoclib(
    parentNode: ITreeItem,
    TypeNode: "DocLib" | "Folder"
  ) {
    let treeData: ITreeItem[] = [];
    let listFolders: any[];
    if (TypeNode == "DocLib") {
      let lists = await sp
        .configure({}, parentNode.AbsoluteUrl)
        .web.lists.get();
      listFolders = lists.filter((item) => {
        return (
          !this.defaultList.includes(item.Title) &&
          item.BaseTemplate == 101 &&
          item.DocumentTemplateUrl !== null
        );
      });
      if (listFolders && listFolders.length > 0) {
        listFolders.forEach((item) => {
          treeData.push({
            children: [],
            UniqueId: item.Id,
            Title: item.Title,
            TypeNode: TypeNode,
            RelativeUrl: item.DocumentTemplateUrl.replace(
              "/Forms/template.dotx",
              ""
            ).replace(/ /g, "%20"),
            Created: moment(item.Created),
            ParentId: parentNode.UniqueId,
            AbsoluteUrl: parentNode.AbsoluteUrl,
            IsLeaf: item.ItemCount == 0 ? true : false,
          });
        });
      }
    } else {
      listFolders = await sp
        .configure({}, parentNode.AbsoluteUrl)
        .web.getFolderByServerRelativeUrl(parentNode.RelativeUrl)
        .folders.get();

      listFolders = listFolders.filter((item) => {
        return !this.defaultFolders.includes(item.Name);
      });

      if (listFolders && listFolders.length > 0) {
        listFolders.forEach((item) => {
          treeData.push({
            children: [],
            UniqueId: item.UniqueId,
            Title: item.Name,
            TypeNode: TypeNode,
            RelativeUrl: item.ServerRelativeUrl.replace(/ /g, "%20"),
            Created: moment(item.TimeCreated),
            ParentId: parentNode.UniqueId,
            AbsoluteUrl: parentNode.AbsoluteUrl,
            IsLeaf: item.ItemCount == 0 ? true : false,
          });
        });
      }
    }

    return treeData || [];
  }

  removeAccents(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }
  // xóa doclib
  public async deleteDoc(parentNode: ITreeItem) {
    await await sp
      .configure({}, parentNode.AbsoluteUrl)
      .web.getFolderByServerRelativeUrl(parentNode.RelativeUrl)
      .delete();
  }

  // async getContentType() {
  //   let a = await sp.web.contentTypes.get();
  // }

  // add 1 doclib
  public async addFolder(parentNode: ITreeItem, nameDocLib: string) {
    await sp
      .configure({}, parentNode.AbsoluteUrl)
      .web.getFolderByServerRelativeUrl(parentNode.RelativeUrl)
      .folders.add(`${parentNode.RelativeUrl}/${nameDocLib}`);
  }

  // add 1 doclib
  public async addDocLib(parentNode: ITreeItem, nameDocLib: string) {
    await sp
      .configure({}, parentNode.AbsoluteUrl)
      .web.lists.add(
        nameDocLib,
        "This is a description of doc lib.",
        101,
        true,
        { OnQuickLaunch: true }
      );
  }

  // lấy ra tất cả các subsite có thể có từ sit cha
  public async getSubSiteInCurrentSite(parentNode: ITreeItem) {
    let treeData: ITreeItem[] = [];
    let subSites = await sp
      .configure({}, parentNode.AbsoluteUrl)
      .web.webs.get();
    if (subSites && subSites.length > 0) {
      subSites.forEach((item) => {
        treeData.push({
          children: [],
          UniqueId: item.Id,
          RelativeUrl: item.ServerRelativeUrl,
          AbsoluteUrl: item.Url,
          Title: item.Title,
          TypeNode: "Site",
          Created: moment(item.Created),
          ParentId: parentNode.UniqueId,
        });
      });
    }
    return treeData || [];
  }

  public findNode(currChild: ITreeItem, key: string) {
    if (currChild.UniqueId == key) {
      return currChild;
    } else if (currChild.children != null) {
      for (let i = 0; i < currChild.children.length; i++) {
        if (currChild.children[i].UniqueId == key) {
          return currChild.children[i];
        } else {
          this.findNode(currChild.children[i], key);
        }
      }
      return null;
    }
    return null;
  }

  public async updateTreeData(
    treeData: ITreeItem[],
    key: string,
    itemUpdate: ITreeItem[]
  ) {
    treeData.forEach((node) => {
      if (node.UniqueId == key) {
        node.children = itemUpdate;
      } else if (node.children && node.children.length > 0) {
        this.updateTreeData(node.children, key, itemUpdate);
      }
    });
    return treeData;
  }

  findIdChidOfNode(treeData: ITreeItem, uniqueId: string[]) {
    uniqueId.push(treeData.UniqueId);
    if (treeData.children && treeData.children.length > 0) {
      treeData.children.forEach((item) => {
        this.findIdChidOfNode(item, uniqueId);
      });
    }
  }

  public async getRolePremission() {
    const roles = await sp.web.getCurrentUserEffectivePermissions();
    console.log(roles);
  }

  public createDataTree(dataSource) {
    let map = {},
      node,
      roots: any[] = [],
      i;

    for (i = 0; i < dataSource.length; i += 1) {
      map[dataSource[i].Code] = i; // initialize the map
      dataSource[i].children = []; // initialize the children
    }

    for (i = 0; i < dataSource.length; i += 1) {
      node = dataSource[i];
      if (node.ParentCode) {
        // if you have dangling branches check that map[node.ParentCode] exists
        dataSource[map[node.ParentCode]].children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
}

export const sideNavController = new SideNavController();
