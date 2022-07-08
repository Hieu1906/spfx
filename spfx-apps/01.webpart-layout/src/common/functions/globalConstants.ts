export const Global = {
  Messages: {
    Create: {
      Success: "Item is posted successfully!",
      Error: "Create item error!",
    },
    Update: {
      Success: "Item is updated successfully!",
      Error: "Update item error!",
    },
    Delete: {
      Success: "Item is deleted successfully!",
      Error: "Delete item error!",
    },
  },
  Functions: {
    getParameterByName(name: string, url?: string): string {
      if (!url) url = location.search;
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
      let data =
        results === null
          ? ""
          : decodeURIComponent(results[1].replace(/\+/g, " "));
      console.log(data);
      return data;
    },
    checkExternalLink(s: string): boolean {
      let regexp =
        /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(s);
    },
    handleName(name: string) {
      let start = name[0];
      let end: string;
      if (name.trim().lastIndexOf(" ") == -1) {
        end = "";
      } else {
        end = name.trim()[name.trim().lastIndexOf(" ") + 1];
      }

      return start + end;
    },
    checkSite(): {
      backNews: string;
      itemNews: string;
      backPhotoAlbum: string;
      backVideosAlbum: string;
      backEvent: string;
      itemsEvent: string;
    } {
      return {
        backNews: "/SitePages/News-Feed.aspx",
        itemNews: "/SitePages/Intranet-News-Feed-item.aspx",
        backPhotoAlbum: "/SitePages/Photo-Gallery.aspx",
        backVideosAlbum: "/SitePages/Video-Gallery.aspx",
        backEvent: "/SitePages/Calendar.aspx",
        itemsEvent: "/SitePages/EventDetail.aspx",
      };
    },
    fileToBase64(img: Blob, callback) {
      const reader = new FileReader();
      reader.addEventListener("load", () => callback(reader.result));
      reader.readAsDataURL(img);
    },
    renameFile(originalFile: File, newName: string) {
      return new File([originalFile], newName, {
        type: originalFile.type,
        lastModified: originalFile.lastModified,
      });
    },
    dataUrlToFile(dataurl: string, filename: string) {
      let arr = dataurl.split(","),
        mime = arr[0]!.match(/:(.*?);/)![1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    },
    getFileIcon(fileType: string) {
      switch (fileType) {
        case "aspx": {
          return "fas fa-link";
          break;
        }
        case "js":
        case "html":
        case "css": {
          return "far fa-file-code";
          break;
        }
        case "xlsx":
        case "xls": {
          return "far fa-file-excel";
          break;
        }
        case "doc":
        case "docx": {
          return "far fa-file-word";
          break;
        }
        case "csv": {
          return "fas fa-file-csv";
          break;
        }
        case "mp4":
        case "flv":
        case "wmv":
        case "avi": {
          return "far fa-file-video";
          break;
        }
        case "ppt":
        case "pptx": {
          return "far fa-file-powerpoint";
          break;
        }
        case "pdf": {
          return "far fa-file-pdf";
          break;
        }
        case "png":
        case "jpeg":
        case "jpg":
        case "gif":
        case "bmp": {
          return "far fa-file-image";
          break;
        }
        case "rar":
        case "zip":
        case "7z": {
          return "far fa-file-archive";
          break;
        }
        default:
          return "far fa-file";
      }
    },
    getFileIconImage(fileType: string) {
      switch (fileType) {
        case "js": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/txt.svg?v1";
          break;
        }
        case "html": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/txt.svg?v1";
          break;
        }
        case "css": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/txt.svg?v1";
          break;
        }
        case "aspx": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/link.svg?v1";
          break;
        }
        case "xlsx": {
          //return "far fa-file-excel";
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/xlsx.svg?v1";
          break;
        }
        case "xls": {
          //return "far fa-file-excel";
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/xlsx.svg?v1";
          break;
        }
        case "doc": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/docx.svg?v1";
          break;
        }
        case "docx": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/docx.svg?v1";
          break;
        }
        case "csv": {
          //return "far fa-file-excel";
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/csv.svg?v1";
          break;
        }
        case "mp4": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/video.svg?v1";
          break;
        }
        case "flv":
        case "wmv":
        case "avi": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/video.svg?v1";
          break;
        }
        case "ppt": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/pptx.svg?v1";
          break;
        }
        case "pptx": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/pptx.svg?v1";
          break;
        }
        case "pdf": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/pdf.svg?v1";
          break;
        }
        case "png": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/photo.svg?v1";
          break;
        }
        case "jpeg": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/photo.svg?v1";
          break;
        }
        case "jpg": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/photo.svg?v1";
          break;
        }
        case "gif": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/photo.svg?v1";
          break;
        }
        case "bmp": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/photo.svg?v1";
          break;
        }
        case "rar": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/zip.svg?v1";
          break;
        }
        case "zip": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/zip.svg?v1";
          break;
        }
        case "7z": {
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/zip.svg?v1";
          break;
        }
        default:
          return "https://spoprod-a.akamaihd.net/files/fabric/assets/item-types-fluent/20/txt.svg?v1";
      }
    },
  },
};
