import { override } from "@microsoft/decorators";
import { Guid, Log } from "@microsoft/sp-core-library";
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
} from "@microsoft/sp-listview-extensibility";
import { Dialog } from "@microsoft/sp-dialog";
import * as ReactDom from "react-dom";
import ModalUploadFile from "./components/ModalUpload";
import * as React from "react";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/security/list";
import "@pnp/sp/site-users/web";
import { PermissionKind } from "@pnp/sp/security";
import {
  FormValue,
  ICustomFileUploadCommandSetProperties,
  ICustomPanelProps,
  SPField,
} from "./interface";
import * as moment from "moment";
import { SPComponentLoader } from "@microsoft/sp-loader";

const LOG_SOURCE: string = "CustomFileUploadCommandSet";

export default class CustomFileUploadCommandSet extends BaseListViewCommandSet<ICustomFileUploadCommandSetProperties> {
  private panelDomElement: HTMLDivElement;
  private canViewAddButton: boolean = false;
  private canViewEditButton: boolean = false;
  @override
  public async onInit() {
    sp.setup({
      spfxContext: this.context,
    });
    this.canViewAddButton = await this.checkCanAddFile();
    this.canViewEditButton=await this.checkCanEditFile();
    SPComponentLoader.loadCss(
      "https://cdnjs.cloudflare.com/ajax/libs/antd/3.26.19/antd.css"
    );
    Log.info(LOG_SOURCE, "Initialized CustomFileUploadCommandSet");
    this.panelDomElement = document.body.appendChild(
      document.createElement("div")
    );
  }

  async checkCanAddFile() {
    let doclib = sp.web.lists.getByTitle("ChungTuLuuTam");

    const canViewAddButton = await doclib.currentUserHasPermissions(
      PermissionKind.AddListItems
    );
    if (!canViewAddButton) {
      console.log("Do not show custom buttons");
    }
    return canViewAddButton;
  }


  async checkCanEditFile() {
    let doclib = sp.web.lists.getByTitle("ChungTuLuuTam");

    const canViewEditButton = await doclib.currentUserHasPermissions(
      PermissionKind.EditListItems
    );
    if (!canViewEditButton) {
      console.log("Do not show custom buttons");
    }
    return canViewEditButton;
  }

  @override
  public async onListViewUpdated(
    event: IListViewCommandSetListViewUpdatedParameters
  ) {
    const editFile: Command = this.tryGetCommand("COMMAND_1");
    const uploadFile: Command = this.tryGetCommand("COMMAND_2");
    if (editFile) {
      // This command should be hidden unless exactly one row is selected.
      editFile.visible =
        event.selectedRows.length === 1 && this.canViewEditButton&&this.checkVisible() ;
    }
    if (uploadFile) {
      // This command should be hidden unless exactly one row is selected.
      uploadFile.visible = this.checkVisible() && this.canViewAddButton;
    }
  }

  checkVisible() {
    return this.context.pageContext.list.title == "ChungTuLuuTam";
  }
  _getformValuesFromFile(event: IListViewCommandSetExecuteEventParameters) {
    let formValues: FormValue = {} as any;
    let fieldsValue = event.selectedRows[0].fields;
    fieldsValue.map((item: SPField) => {
      if (item.fieldType == "Lookup") {
        let originValue = event.selectedRows[0].getValueByName(
          item.internalName
        );
        if (originValue?.length > 0) {
          formValues[`${item.internalName}Id`] = originValue[0]["lookupId"];
        }
      } else if (item.fieldType == "DateTime") {
        let originValue = event.selectedRows[0].getValueByName(
          item.internalName
        );

        if (originValue?.length > 0) {
          formValues[`${item.internalName}`] = moment(originValue[0]);
        }
      } else {
        formValues[`${item.internalName}`] =
          event.selectedRows[0].getValueByName(item.internalName);
      }
    });

    formValues.FileRef = event.selectedRows[0].getValueByName("FileRef");
    formValues.UniqueId = event.selectedRows[0].getValueByName("UniqueId");

    return formValues;
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    console.log(event);
    switch (event.itemId) {
      case "COMMAND_1":
        let formValues = this._getformValuesFromFile(event);
        this._showPanel(formValues);

        break;
      case "COMMAND_2":
        this._showPanel();
        break;
      default:
        throw new Error("Unknown command");
    }
  }
  private _showPanel(formValues?: FormValue) {
    this._renderPanelComponent({
      isOpen: true,
      formValues,
      listId: this.context.pageContext.list.id.toString(),
      onClose: async () => {
        this._dismissPanel();
      },
    });
  }

  private _dismissPanel() {
    this._renderPanelComponent({
      isOpen: false,
    });
  }

  private _renderPanelComponent(props: any) {
    const element: React.ReactElement<ICustomPanelProps> = React.createElement(
      ModalUploadFile,
      {
        onClose: props.onClose && props.onClose,
        formValues: props.formValues,
        isOpen: props.isOpen,
        listId: props.props,
        context: this.context,
        raiseOnChange: this.raiseOnChange,
      }
    );
    ReactDom.render(element, this.panelDomElement);
  }
}
