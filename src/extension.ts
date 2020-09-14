"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Initializer } from "./initializer";
import { Command } from "./common/constant/Command";
import { MenuTreeViewProvider } from "./provider/MenuTreeViewProvider";
import { Logger } from "./common/utils/Logger";
import { WebViewCommand } from "./command/WebViewCommand";
import { WebViewCommandArgument, WebviewType } from "./command/CommandArgument";
import { ConfigurationUtils } from "./common/utils/ConfigurationUtils";
import { Fether } from "./net/Fether";
import { ProjectInfoUtils, Info } from "./common/utils/ProjectInfoUtils";

import { StatusBarManager } from "./common/utils/StatusBarManager";

export function activate(context: vscode.ExtensionContext) {
  let startTime: number = new Date().getTime();

  //初始化期，初始化基本数据
  new Initializer()
    .init()
    .then(() => {
      //注册command
      new WebViewCommand().registerCommand(context);

      initViews(context);

      Logger.logActivate(new Date().getTime() - startTime, "");
      Logger.log("插件启动成功");
    })
    .catch((info) => {
      Logger.logActivate(new Date().getTime() - startTime, info);
      Logger.error(info);
    });
}

export function deactivate() {
  //销毁 StatusBarManager
  StatusBarManager.dispose();
  recoverBesideEditor();
  Logger.logDeactivate();
}
function recoverBesideEditor() {
  // 回收打开的侧边 编辑器
  const editors = vscode.window.visibleTextEditors;
  editors.forEach((item: vscode.TextEditor) => {
    let vc: vscode.ViewColumn | undefined = item.viewColumn;
    if (vc && vc === vscode.ViewColumn.Beside) {
      item.hide();
    }
  });
}

function initViews(context: vscode.ExtensionContext) {
  let nickname = ConfigurationUtils.getNickname();
  //没有设置nickname，显示欢迎页面

  if (nickname) {
    initStatusBar(nickname, context);
  } else {
    let arg: WebViewCommandArgument = new WebViewCommandArgument();
    arg.webviewType = WebviewType.Welcome;
    vscode.commands.executeCommand(Command.COMMAND_WEBVIEW_SHOW, arg);
  }

  //初始化Menu View
  let menuTreeViewProvider: MenuTreeViewProvider = new MenuTreeViewProvider(
    context
  );
  vscode.window.registerTreeDataProvider(
    "moon-menu-view",
    menuTreeViewProvider
  );
}

function initStatusBar(nickname: string, context: vscode.ExtensionContext) {
  let info: Info = ProjectInfoUtils.getInfo();
  let projectName = info ? info.name : "";
  StatusBarManager.init(context);
  Fether.getShortcut(nickname, projectName)
    .then((arr) => {
      let data = arr.length === 0 ? { nickname, list: [] } : arr[0];
      if (data && data.list) {
        data.list.forEach((item: any) => {
          StatusBarManager.createOpenBrowserStatusBar(item.name, item.url);
        });
      }
    })
    .catch((msg) => {
      //console.error(msg);
    });
}
