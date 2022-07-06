import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetListViewUpdatedParameters,
  IListViewCommandSetExecuteEventParameters,
} from "@microsoft/sp-listview-extensibility";
import { Dialog } from "@microsoft/sp-dialog";
import * as ReactDom from "react-dom";
import ModalUploadFile, { ICustomPanelProps } from "./components/ModalUpload";
import * as React from "react";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICustomFileUploadCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = "CustomFileUploadCommandSet";

export default class CustomFileUploadCommandSet extends BaseListViewCommandSet<ICustomFileUploadCommandSetProperties> {
  private panelDomElement: HTMLDivElement;
  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, "Initialized CustomFileUploadCommandSet");
    this.panelDomElement = document.body.appendChild(
      document.createElement("div")
    );
    this.panelDomElement.className = "hihihih";

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(
    event: IListViewCommandSetListViewUpdatedParameters
  ): void {
    const compareOneCommand: Command = this.tryGetCommand("COMMAND_1");
    const uploadFile: Command = this.tryGetCommand("COMMAND_2");
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = event.selectedRows.length === 1;
    }
    if (uploadFile) {
      // This command should be hidden unless exactly one row is selected.
      uploadFile.visible = this.checkVisible();
    }
  }

  checkVisible() {
    return (
      this.context.pageContext.list.title.toLocaleLowerCase() ==
      "chứng từ lưu tạm"
    );
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case "COMMAND_1":
        this._showPanel(1, "sgsdfsdf");
        break;
      case "COMMAND_2":
        this._showPanel(1, "sgsdfsdf");
        break;
      default:
        throw new Error("Unknown command");
    }
  }
  private _showPanel(itemId: number, currentTitle: string) {
    this._renderPanelComponent({
      isOpen: true,
      currentTitle,
      itemId,
      listId: this.context.pageContext.list.id.toString(),
      onClose: () => {
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
        currentTitle: props.currentTitle,
        itemId: props.itemId,
        isOpen: props.isOpen,
        listId: props.props,
      }
    );
    ReactDom.render(element, this.panelDomElement);
  }
}
