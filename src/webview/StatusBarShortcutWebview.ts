import * as vscode from 'vscode'
import { BaseView } from './BaseView'
import { WebCommand } from '../common/constant/WebCommand'
import { Fether } from '../net/Fether'
import { ConfigurationUtils } from '../common/utils/ConfigurationUtils'
import { ShortcutInfo } from '../model/ShortcutInfo'
import { Info, ProjectInfoUtils } from '../common/utils/ProjectInfoUtils'
import { StatusBarManager } from '../common/utils/StatusBarManager'

export class StatusBarShortcutWebview extends BaseView {
  public show() {
    let path = './web/status-bar-shortcut.html'
    let title = 'StatusBar快捷方式设置'
    this.createWebview(path, title, vscode.ViewColumn.Active)
    this.onDidReceiveMessage((e) => {
      if (e.type === WebCommand.GET_SHORTCUT) {
        this.getShortcut()
      } else if (e.type === WebCommand.SAVE_SHORTCUT) {
        this.saveShortcut(e.data)
      }
    })
  }
  private getShortcut() {
    let nickname = ConfigurationUtils.getNickname()
    let info: Info = ProjectInfoUtils.getInfo()
    let projectName = info ? info.name : ''
    if (!projectName) {
      this.postMessage(WebCommand.GET_SHORTCUT, {
        ok: false,
        msg: '没有package.json文件或者没有找到Moon相关配置信息，请确保当前项目是一个 Moon 项目！',
      })
      return
    }
    if (nickname) {
      Fether.getShortcut(nickname, projectName)
        .then((arr) => {
          let data = arr.length === 0 ? { nickname, list: [] } : arr[0]
          this.postMessage(WebCommand.GET_SHORTCUT, { ok: true, ...data })
        })
        .catch((msg) => {
          this.postMessage(WebCommand.GET_SHORTCUT, {
            ok: false,
            msg: '网络链接错误，请确保在内网环境中使用',
          })
        })
    } else {
      this.postMessage(WebCommand.GET_SHORTCUT, {
        ok: false,
        msg: '请在插件基本信息设置里设置您的花名',
      })
    }
  }
  private saveShortcut(shortcut: ShortcutInfo | any) {
    let info: Info = ProjectInfoUtils.getInfo()
    let projectName = info ? info.name : ''

    if (!projectName) {
      this.postMessage(WebCommand.GET_SHORTCUT, {
        ok: false,
        msg: '没有package.json文件或者没有找到Moon相关配置信息，请确保当前项目是一个 Moon 项目！',
      })
      return
    }
    if (shortcut) {
      shortcut.projectName = projectName
    }
    Fether.updateShortcut(shortcut)
      .then((data) => {
        StatusBarManager.refreshStatusBars(shortcut.list)

        this.postMessage(WebCommand.SAVE_SHORTCUT, { ok: true })
      })
      .catch((msg) => {
        this.postMessage(WebCommand.SAVE_SHORTCUT, {
          ok: false,
          msg: '网络链接错误，请确保在内网环境中使用',
        })
      })
  }
}
