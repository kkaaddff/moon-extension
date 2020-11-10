import * as vscode from 'vscode'
import { Command } from '../common/constant/Command'
import { WebViewCommandArgument, WebviewType } from './CommandArgument'
import { BaseView } from '../webview/BaseView'
import { WelcomeWebview } from '../webview/WelcomeWebview'
import { StatusBarShortcutWebview } from '../webview/StatusBarShortcutWebview'
import { SettingWebview } from '../webview/SettingWebview'

export class WebViewCommand {
  /**
   * 注册command
   * @param context
   */
  public registerCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        Command.COMMAND_WEBVIEW_SHOW,
        (args: WebViewCommandArgument) => {
          let webview: BaseView | undefined | null
          if (args.webviewType === WebviewType.Welcome) {
            webview = new WelcomeWebview(context)
          } else if (args.webviewType === WebviewType.StatusBarShortcut) {
            webview = new StatusBarShortcutWebview(context)
          } else if (args.webviewType === WebviewType.RapScan) {
          } else if (args.webviewType === WebviewType.Setting) {
            webview = new SettingWebview(context)
          } else if (args.webviewType === WebviewType.About) {
          }
          if (webview) {
            webview.show()
          }
        }
      )
    )
  }
}
