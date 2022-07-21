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

const LOG_SOURCE: string = "CustomFileUploadCommandSet";

export default class CustomFileUploadCommandSet extends BaseListViewCommandSet<ICustomFileUploadCommandSetProperties> {
  private panelDomElement: HTMLDivElement;
  private canViewButton: boolean = false;
  @override
  public async onInit() {
    sp.setup({
      spfxContext: this.context,
    });
    this.canViewButton = await this.checkShowButton();

    Log.info(LOG_SOURCE, "Initialized CustomFileUploadCommandSet");
    this.panelDomElement = document.body.appendChild(
      document.createElement("div")
    );
  }

  async checkShowButton() {
    let doclib = sp.web.lists.getByTitle("Chứng từ lưu tạm");

    const canViewButton = await doclib.currentUserHasPermissions(
      PermissionKind.AddListItems
    );
    if (!canViewButton) {
      console.log("Do not show custom buttons");
    }
    return canViewButton;
  }

  @override
  public async onListViewUpdated(
    event: IListViewCommandSetListViewUpdatedParameters
  ) {
    const compareOneCommand: Command = this.tryGetCommand("COMMAND_1");
    const uploadFile: Command = this.tryGetCommand("COMMAND_2");
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible =
        event.selectedRows.length === 1 && this.canViewButton;
    }
    if (uploadFile) {
      // This command should be hidden unless exactly one row is selected.
      uploadFile.visible = this.checkVisible() && this.canViewButton;
    }
  }

  checkVisible() {
    return (
      this.context.pageContext.list.title.toLocaleLowerCase() ==
      "chứng từ lưu tạm"
    );
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
