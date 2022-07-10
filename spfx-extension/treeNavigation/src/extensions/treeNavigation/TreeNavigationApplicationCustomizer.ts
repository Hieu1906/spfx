import { override } from "@microsoft/decorators";

import { BaseApplicationCustomizer } from "@microsoft/sp-application-base";
import "./navigation.css";

import styles from "./components/SideNav/scss/SideNav.module.scss";
import { SPComponentLoader } from "@microsoft/sp-loader";
import { sp } from "@pnp/sp";
import { ISideNavProps } from "./components/SideNav/ISideNavProps";
import * as React from "react";
import SideNav from "./components/SideNav/SideNav";

import * as ReactDom from "react-dom";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ITreeNavigationApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class TreeNavigationApplicationCustomizer extends BaseApplicationCustomizer<ITreeNavigationApplicationCustomizerProperties> {
  @override
  public async onInit(): Promise<void> {
    super.onInit();
    sp.setup({
      spfxContext: this.context,
    });
    console.log("Extension v1.0.0.3");
    console.log(this.context);
    SPComponentLoader.loadCss(
      "https://cdnjs.cloudflare.com/ajax/libs/antd/3.26.19/antd.css"
    );
    SPComponentLoader.loadCss(
      `${this.context.pageContext.site.absoluteUrl}/apps/rfa/adms/Documents/hidenNavDefault.css`

    );
    SPComponentLoader.loadCss(
      `${this.context.pageContext.site.absoluteUrl}/apps/rfa/adms/Shared%20Documents/hidenNavDefault.css`

    );

    console.log(this.context);

    setTimeout(() => {
      this.context.placeholderProvider.changedEvent.add(
        this,
        this.renderPlaceHolders
      );
    }, 300);
  }

  getContentElement = function () {
    // check 2 th là SitePage và site chuẩn
    let e = document.querySelector(".Files-rightPaneInteractionContainer");

    if (e) {
      var t = document.createElement("div");
      (t.style.display = "flex"),
        (t.style.height = "100%"),
        (t.style.width = "100%"),
        (t.id = "container_extension"),
        e.parentNode!.appendChild(t),
        (e.id = "right_element"),
        t.appendChild(e);
    } else {
      let spPageCanvasContent: any = document.getElementById(
        "spPageCanvasContent"
      );
      if (spPageCanvasContent) {
        let element = spPageCanvasContent.nextSibling;
        element.style.display = "none";
      }

      e = document.querySelector(".SPCanvas-canvas");
      var t = document.createElement("div");
      (t.style.display = "flex"),
        (t.style.maxHeight = `${window.innerHeight - 205}px`),
        (t.style.height = `${window.innerHeight - 205}px`),
        (t.style.width = "100%"),
        (t.id = "container_extension"),
        e!.parentNode!.appendChild(t),
        (e!.id = "right_element");
      e!.parentNode!.appendChild(t), t.appendChild(e as any);
    }
    return e;
  };

  getPlaceholderForNavigation(classElement: string) {
    var e: any;
    var b: any;
    var t = this.getContentElement();
    t &&
      ((e = document.createElement("div")),
      ((e as HTMLDivElement).className = classElement),
      ((e as HTMLDivElement).id = "left_element"),
      (b = document.createElement("div")),
      ((b as HTMLDivElement).id = "drag__element"),
      t!.parentNode!.insertBefore(e, t),
      t!.parentNode!.insertBefore(b, t));

    return (
      e && ((e as HTMLDivElement).style.maxHeight = e.clientHeight + "px"), e
    );
  }

  private renderPlaceHolders(): void {
    let e = this.getPlaceholderForNavigation(styles.wrapperTreeNavigation);

    const element: React.ReactElement<ISideNavProps> = React.createElement(
      SideNav,
      {
        context: this.context,
      }
    );
    ReactDom.render(element, e);
  }
}
