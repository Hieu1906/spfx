import { cloneDeep, sortBy, uniq } from "lodash";
import { sp } from "@pnp/sp";
import { Button, Input, Modal, Spin, Tree } from "antd";
import { AntTreeNode, AntTreeNodeExpandedEvent } from "antd/lib/tree";
import * as moment from "moment";
import * as React from "react";
import { BaseComponent } from "../commonComponent/BaseComponent";
import { ISideNavProps } from "./ISideNavProps";
import { ISideNavState, ITreeItem } from "./ISideNavState";
import styles from "./scss/SideNav.module.scss";
import { sideNavController } from "./SideNav.controller";

const { TreeNode } = Tree;

const confirm = Modal.confirm;
export default class SideNav extends BaseComponent<
  ISideNavProps,
  ISideNavState
> {
  constructor(props: ISideNavProps) {
    super(props);
    this.state = {
      loading: true,
      dataSource: [],
      expandKeys: [],
      isResizing: false,
      isSearched: false,
      valueSearch: "",
      treeData: [],
    };
    this.onMount(async () => {
      await this.initTreeDocument();
      await this.hideIconFirstNodeExpand();
    });
  }

  public async hideIconFirstNodeExpand() {
    let element: any = document.querySelector(
      ".ant-tree.ant-tree-show-line li span.ant-tree-switcher.ant-tree-switcher_open"
    );

    element.style.display = "none";
  }

  async getRootNode() {
    let rootNode: any[] = [];
    let rootWeb = await sp
      .configure(
        {},
        `${this.props.context.pageContext.site.absoluteUrl}/apps/rfa/khoctkt`
      )
      .web.get();
    rootNode.push({
      children: [],
      UniqueId: rootWeb.Id,
      RelativeUrl: rootWeb.ServerRelativeUrl,
      AbsoluteUrl: rootWeb.Url,
      Title: rootWeb.Title,
      TypeNode: "Site",
      Created: moment(rootWeb.Created),
      ParentId: null,
    } as any);
    return rootNode;
  }

  // Khởi tạo cây
  public async initTreeDocument() {
    let dataSource: {
      Icon?: JSX.Element;
      Title?: string;
      Url?: string;
      TreeData?: ITreeItem[];
    }[] = [];

    // tao ra nhánh chính với thông tin lấy từ site đang đứng
    let rootNode = await this.getRootNode();
    await this.setState({
      treeData: rootNode,
      expandKeys: [rootNode[0].UniqueId],
    });
    await this.expandNode(rootNode[0]);

    dataSource.push({
      TreeData: this.state.treeData,
    });
    this.setState({
      dataSource,
    });
  }

  // check xem site hiện tại có phải root site ko, nếu ko thì cần cập nhật hết các subsite vào cây cho đến node là site hiện tại để active lên
  public async expandNode(nodeParent: ITreeItem) {
    let children = await this.onExpandCollapse(nodeParent);
    // với các node con tìm đk sẽ tìm ra các node con tiếp theo cho đến khi site hiện tại
    let nodeNext = children.find((item) => {
      return decodeURIComponent(
        window.location.href.toLocaleLowerCase()
      ).includes(item.RelativeUrl.toLocaleLowerCase() as string);
    });
    if (nodeNext) {
      await this.expandNode(nodeNext);
    } else {
      await this.setState({
        seletedKey: [nodeParent.UniqueId],
        expandKeys: [nodeParent.UniqueId],
      });
    }
  }

  // render tree node
  public renderTreeNodes = (data: ITreeItem[]) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode
            isLeaf={item.IsLeaf}
            key={item.UniqueId}
            title={
              <div style={{ display: "flex", flexDirection: "column" }}>
                {this.renderCustomTreeItem(item)}
                <Spin
                  style={{ marginTop: 5 }}
                  tip="Đang tải dữ liệu..."
                  spinning={
                    this.state.loading && item.UniqueId == this.state.activeKey
                  }
                />
              </div>
            }
            dataRef={item}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...(item as any)} />;
    });
  };

  renderIcon(item: ITreeItem) {
    let icon: JSX.Element;
    switch (item.TypeNode) {
      case "Site":
        icon = iconSite;
        return icon;
      case "DocLib":
        icon = iconDoclib;
        return icon;

      case "Folder":
        icon = iconFolder;

        return icon;
    }
  }

  // custom render item tree node
  public renderCustomTreeItem(item: ITreeItem): JSX.Element {
    return (
      <div className={styles.navigationTree__container__tree__itemNode}>
        <div
          className={styles.navigationTree__container__tree__itemNode__item}
          onContextMenu={(e) => {
            e.preventDefault();
            this.setState({
              visiblePopover: true,
              activeKey: item.UniqueId,
            });
          }}
          onClick={() => {
            window.open(
              item.TypeNode == "DocLib"
                ? `${item.RelativeUrl}/Forms/AllItems.aspx`
                : `${item.RelativeUrl}`,
              "_self"
            );
          }}
        >
          {this.renderIcon(item)}
          <span
            className={
              styles.navigationTree__container__tree__itemNode__item__title
            }
          >
            {item.Title}
          </span>
        </div>
      </div>
    );
  }

  public async onExpandCollapse(item: ITreeItem) {
    // check xem item là doclib hay subsite để load dữ liệu cho phù hợp
    await this.setState({
      loading: true,
      activeKey: item.UniqueId,
    });
    let treeData: ITreeItem[];
    let children: ITreeItem[];
    let preTreeData: ITreeItem[] = [];
    // th node được expand là doclib hoặc folder sẽ lấy thông tin node cha để tìm ra node con và cập nhật vào tree
    if (item.TypeNode == "DocLib" || item.TypeNode == "Folder") {
      children = await sideNavController.getFolderorDoclib(item, "Folder");
      preTreeData = cloneDeep(this.state.treeData) as ITreeItem[];
    } else {
      // th node được expand là subsite sẽ làm các bước sau
      //lấy thông tin node cha để tìm các subsite và doclib của node tương ứng
      let [subSites, docLibsInSubStie] = await Promise.all([
        sideNavController.getSubSiteInCurrentSite(item),
        sideNavController.getFolderorDoclib(item, "DocLib"),
      ]);
      children = sortBy(subSites.concat(docLibsInSubStie), "Created", "desc");
      preTreeData = cloneDeep(this.state.treeData) as ITreeItem[];
    }

    treeData = await sideNavController.updateTreeData(
      preTreeData,
      item.UniqueId,
      children
    );

    await this.setState({
      loading: false,
      activeKey: "",
      treeData: treeData,
    });

    return children || [];
  }

  // expand node sau khi data đk load
  public onExpand(expandedKeys: string[], info: AntTreeNodeExpandedEvent) {
    if (!info.expanded) {
      let uniqueId: string[] = [];
      sideNavController.findIdChidOfNode(info.node.props["dataRef"], uniqueId);
      expandedKeys = expandedKeys.filter((item) => {
        return !uniqueId.includes(item);
      });
      this.setState({
        expandKeys: expandedKeys,
      });
      uniqueId = [];
    } else {
      this.setState({
        expandKeys: uniq(this.state.expandKeys.concat(expandedKeys)),
      });
    }
  }

  renderViewNavigation(item: {
    Icon?: JSX.Element;
    Title?: string;
    Url?: string;
    TreeData?: ITreeItem[];
  }) {
    return !item.TreeData ? (
      <div
        className={styles.navigationTree__container__item}
        onClick={() => {
          window.open(`${item.Url}`, "_self");
        }}
      >
        {item.Icon}
        <span
          className={
            styles.navigationTree__container__tree__itemNode__item__title
          }
        >
          {item.Title}
        </span>
      </div>
    ) : (
      <Tree
        showIcon={false}
        multiple={false}
        selectedKeys={this.state.seletedKey}
        loadData={async (node: AntTreeNode) => {
          if ((node.props.children as any).length > 0) {
            console.log("don't load data");
          } else {
            await this.onExpandCollapse(node.props["dataRef"]);
          }
        }}
        onExpand={(expandedKeys: string[], info: AntTreeNodeExpandedEvent) => {
          this.onExpand(expandedKeys, info);
        }}
        expandedKeys={this.state.expandKeys}
        className={styles.navigationTree__container__tree}
        showLine
      >
        {this.renderTreeNodes(this.state.treeData as ITreeItem[])}
      </Tree>
    );
  }

  NavigateSearchWp(valueSearch?: string) {
    let urlSplitted = window.location.href.match("^[^?]*")![0].split("/");
    console.log(urlSplitted);
    if (valueSearch.length > 0) {
      window.open(
        `${this.props.context.pageContext.site.absoluteUrl}/apps/rfa/khoctkt/SitePages/Search.aspx?keyword=${this.state.valueSearch}&baseUrl=${this.props.context.pageContext.web.absoluteUrl}`,
        "_self"
      );
    } else {
      window.open(
        `${this.props.context.pageContext.site.absoluteUrl}/apps/rfa/khoctkt/SitePages/Search.aspx?baseUrl=${this.props.context.pageContext.web.absoluteUrl}`,
        "_self"
      );
    }
  }
  public render() {
    return (
      <div className={styles.navigationTree__container}>
        {this.state.isSearched ? (
          <div
            className={
              styles.navigationTree__container__tree__search__wrapperSearchInput
            }
          >
            <Input
              size="default"
              value={this.state.valueSearch}
              onPressEnter={(e) => {
                e.preventDefault();
                this.NavigateSearchWp(this.state.valueSearch);
              }}
              onChange={(e) => {
                this.setState({
                  valueSearch: e.target.value,
                });
              }}
              autoFocus={true}
              placeholder="Nhập từ Khóa"
              className={
                styles.navigationTree__container__tree__search__wrapperSearchInput__input
              }
            />
            <div
            style={{marginTop:5}}
              className={
                styles.navigationTree__container__tree__search__wrapperSearchInput__buttons
              }
            >
              <Button
                onClick={() => {
                  this.setState({
                    isSearched: false,
                  });
                }}
                style={{ marginLeft: 10 }}
                type="danger"
                size="small"
              >
                Hủy
              </Button>
              <Button
                size="small"
                onClick={() => {
                  this.NavigateSearchWp(this.state.valueSearch);
                }}
                style={{ marginLeft: 10 }}
                type="primary"
              >
                Tìm kiếm
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={styles.navigationTree__container__tree__search}
            onClick={() => {
              this.setState({
                isSearched: true,
              });
            }}
          >
            <svg
              className={styles.navigationTree__container__tree__search__icon}
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={
                  styles.navigationTree__container__tree__search__icon__fill
                }
                d="M11.8125 11.5391L8.67188 8.39844C9.35156 7.57812 9.72656 6.52344 9.72656 5.375C9.72656 2.70312 7.52344 0.5 4.85156 0.5C2.15625 0.5 0 2.70312 0 5.375C0 8.07031 2.17969 10.25 4.85156 10.25C5.97656 10.25 7.03125 9.875 7.875 9.19531L11.0156 12.3359C11.1328 12.4531 11.2734 12.5 11.4375 12.5C11.5781 12.5 11.7188 12.4531 11.8125 12.3359C12.0469 12.125 12.0469 11.7734 11.8125 11.5391ZM1.125 5.375C1.125 3.3125 2.78906 1.625 4.875 1.625C6.9375 1.625 8.625 3.3125 8.625 5.375C8.625 7.46094 6.9375 9.125 4.875 9.125C2.78906 9.125 1.125 7.46094 1.125 5.375Z"
                fill="#096DD9"
              />
            </svg>

            <span
              className={styles.navigationTree__container__tree__search__title}
            >
              {" "}
              Tìm kiếm
            </span>
          </div>
        )}
        {this.state.dataSource.map((item) => this.renderViewNavigation(item))}
      </div>
    );
  }
}
// const iconHome = (
//   <svg
//     className={styles.navigationTree__container__tree__itemNode__item__imgHome}
//     width="30"
//     height="30"
//     viewBox="0 0 24 24"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <circle
//       className={
//         styles.navigationTree__container__tree__itemNode__item__imgHome__circle
//       }
//       cx="12"
//       cy="12"
//       r="9.5"
//       stroke="#DC0D15"
//     ></circle>
//     <path
//       className={
//         styles.navigationTree__container__tree__itemNode__item__imgHome__fill
//       }
//       d="M7.00002 14.8362H8.01801L8.13924 11.3077H7.61145V10H16.3886V11.3077H15.8608L15.982 14.8362H17V16.3636H7V14.8362H7.00002ZM13.0894 14.8362H13.8031L13.9244 11.3077H12.9682L13.0894 14.8362ZM10.1969 14.8362H10.9106L11.0318 11.3077H10.0757L10.1969 14.8362Z"
//       fill="#DC0D15"
//     ></path>
//     <path
//       className={
//         styles.navigationTree__container__tree__itemNode__item__imgHome__fill
//       }
//       d="M7 9.63636V9.07068L12 6L17 9.07068V9.63636H7Z"
//       fill="#DC0D15"
//     ></path>
//   </svg>
// );

const iconSite = (
  <svg
    className={styles.navigationTree__container__tree__itemNode__item__img}
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className={
        styles.navigationTree__container__tree__itemNode__item__img__fill
      }
      d="M1.19434 1.04764C1.19434 0.637318 1.52697 0.304688 1.93729 0.304688H13.8245C14.2348 0.304688 14.5675 0.637318 14.5675 1.04764V6.50535C14.5675 6.91567 14.2348 7.2483 13.8245 7.2483H1.93729C1.52697 7.2483 1.19434 6.91567 1.19434 6.50535V1.04764Z"
      fill="#3A8CE4"
    />
    <path
      d="M4.66602 4.86033V2.66211H11.2813V4.86033H4.66602Z"
      stroke="white"
    />
    <path
      className={
        styles.navigationTree__container__tree__itemNode__item__img__fill
      }
      d="M1.19434 9.24295C1.19434 8.83263 1.52697 8.5 1.93729 8.5H13.8245C14.2348 8.5 14.5675 8.83263 14.5675 9.24295V14.7007C14.5675 15.111 14.2348 15.4436 13.8245 15.4436H1.93729C1.52697 15.4436 1.19434 15.111 1.19434 14.7007V9.24295Z"
      fill="#3A8CE4"
    />
    <path
      d="M4.66602 13.0556V10.8574H11.2813V13.0556H4.66602Z"
      stroke="white"
    />
  </svg>
);
const iconDoclib = (
  <svg
    className={styles.navigationTree__container__tree__itemNode__item__img}
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8 1L6 4.5H0V15.5H7.03444V13.5344H3V6.5H14L16 8.5L15.9999 1H8ZM14.5 4.5L14.5 2.5H8.5L7.5 4.5H14.5Z"
      fill="#E6B359"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M7 7.5H4V12.5H7V7.5ZM6 8.5H5V9.5H6V8.5ZM6 10.5H5V11.5H6V10.5Z"
      fill="#E6B359"
    />
    <path
      d="M15.1017 9.75842L14.9036 9.56031L13.7348 8.39148L12.8631 7.5H9.00018C9 8.37167 9 7.97546 9 8.54997V9.24334V10.1943V11.0659V12.7102V16.563C9 16.563 9.47546 16.563 10.05 16.563H15.7753C15.7753 16.3443 15.7753 16.0875 15.7753 15.513V11.6602V10.432L15.1017 9.75842ZM14.2895 10.1744H13.1206C13.1206 10.0615 13.1206 10.0952 13.1206 9.99615V9.00561L14.2895 10.1744ZM14.9036 15.4932C14.9036 15.5922 14.8243 15.6715 14.7253 15.6715H9.87167C9.87167 15.684 9.87167 15.5922 9.87167 15.4932V12.6904V11.0461V10.1744V9.22353V8.54997C9.87167 8.45091 9.87167 8.41057 9.87167 8.37167H10.7235H11.6348H12.249V9.97634C12.249 10.2339 12.249 10.8651 12.249 11.0263C12.5065 11.0263 12.9819 11.0263 13.2989 11.0263H14.9036V12.6706V15.4932Z"
      fill="#777777"
    />
  </svg>
);

const iconFolder = (
  <svg
    className={styles.navigationTree__container__tree__itemNode__item__img}
    width="16"
    height="15"
    viewBox="0 0 16 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8 0.5L6 3.5H0L3 5.5H15.9999V0.5H8ZM14.5 3.5L14.5 2H8.5L7.5 3.5H14.5Z"
      fill="#E6B359"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0 3.5V14.5H7.03444V12.5344H2V5.5H15.9999V3.5H0Z"
      fill="#E6B359"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M0 14.5V3.5H7.03444V5.46555H2V12.5H16L15.9999 14.5H0Z"
      fill="#E6B359"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15.9999 14.5V3.5H8.96556V5.46555H14V12.5H0V14.5H15.9999Z"
      fill="#E6B359"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M6 6.5H3V11.5H6V6.5ZM5 7.5H4V8.5H5V7.5ZM5 9.5H4V10.5H5V9.5Z"
      fill="#E6B359"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M10 6.5H6V11.5H10V6.5ZM8.66667 7.5H7.33333V8.5H8.66667V7.5ZM8.66667 9.5H7.33333V10.5H8.66667V9.5Z"
      fill="#E6B359"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M13 6.5H10V11.5H13V6.5ZM12 7.5H11V8.5H12V7.5ZM12 9.5H11V10.5H12V9.5Z"
      fill="#E6B359"
    />
    <path d="M1 4.5H15V12.5H1V4.5Z" fill="#E6B359" />
  </svg>
);
