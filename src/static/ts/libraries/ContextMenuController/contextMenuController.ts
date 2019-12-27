/**
 * @file [Library] Controller to generate context menu for JointJS paper
 * @author Louis Sung <ls@sysmaker.org> All Rights Reserved
 * @version v0.2.0
 * @licence MIT
 */

import * as joint from 'jointjs';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';

export class ContextMenuController {
  public get menu() { return this.current.menu; }    // for `.html` to render contextmenu

  private menuInfo: ContextMenuInfo;    // record event binding target (paper)
  private current: CurrentInfo = {menu: null, events: null, eventInfo: null};    // decided by the MenuType of target
  private binding: BindingInfo = {menu: {}, events: {}};    // context menu and events list for each MenuType

  public onClick(id: string): void {
    const action = this.current.events[id];
    if (action !== undefined) {
      action(this.current.eventInfo);    // pass current event info to menu option callback function
    } else {
      console.error(`Event for OPTION-"${id}" is undefined`);
    }
  }

  public bind(contextMenuInfo: ContextMenuInfo): void {
    if (contextMenuInfo.component !== undefined) {
      this.menuInfo = contextMenuInfo;
      for (const menuType of [MenuType.blank, MenuType.cell, MenuType.element, MenuType.link]) {
        if (this.binding.menu[menuType].length > 0) {
          // console.log(`INFO: Bind event "paper.on.${menuType}:contextmenu"`);
          this.menuInfo.paper.on(`${menuType}:contextmenu`, (menuType === MenuType.blank) ?
            (event, x, y): void  => { callbackFunc(MenuType.blank, event, x, y); } :    // "blank" events have no cellView
            (cellView, event, x, y): void => { callbackFunc(menuType, event, x, y, cellView); }    // cell, element, or link
          );
        }
      }
    } else {
      console.error('ERR: Function "bind()" should be called within "ngAfterViewInit()" in "*.component.ts"');
    }
    const callbackFunc = (menuType: MenuType, event: JQuery.ContextMenuEvent, x: number, y: number, cellView?: joint.dia.CellView) => {
      this.current.menu = this.binding.menu[menuType];    // update context menu in `.html` by menuType
      this.current.events = this.binding.events[menuType];    // update events with corresponding menuType
      this.menuInfo.service.create(event.originalEvent, this.menuInfo.component);    // open context menu
      this.current.eventInfo = {cellView, event, x, y};    // record event info for callback function
    };
  }
  public unbind(menuType?: MenuType): void {
    if (this.menuInfo === undefined) {
      console.error('ERR: Try to unbind before bound (call "bind()" in "*.component.ts" first)');
    } else {
      const unbindTarget = (menuType !== undefined) ? [menuType] : [MenuType.blank, MenuType.cell, MenuType.element, MenuType.link];
      for (const unbind of unbindTarget) {
        console.log(`INFO: Unbind event "paper.on.${unbind}:contextmenu"`);
        this.menuInfo.paper.off(`${unbind}:contextmenu`);
      }
    }
  }

  public bindContextMenuWithEvents(menuType: MenuType, contextMenu?: ContextMenu, clickEvents?: ClickEvents) {
    // update as new values if given, keep old values if not given, and init as empty if there's no old value
    // pass contextMenu as [] or clickEvents as {} to manually clear up old values
    this.binding.menu[menuType] = contextMenu || this.binding.menu[menuType] || [];
    this.binding.events[menuType] = clickEvents || this.binding.events[menuType] || {};

    if (this.binding.menu[menuType].length > 0) {
      // extract click event list from given contextmenu
      const expectedEvents = this.extractIdAndEvent(this.binding.menu[menuType]);
      Object.assign(expectedEvents, this.binding.events[menuType]);    // update expectedEvents with binding events
      for (const [id, event] of Object.entries(expectedEvents)) {
        if (event === undefined) {
          console.warn(`WARN: Event for OPTION-"${id}" in MENU-"${menuType}" should be defined`);
        }
      }
      this.binding.events[menuType] = expectedEvents;
    }
  }

  constructor() {
    for (const menuType of Object.values(MenuType)) {
      this.bindContextMenuWithEvents(menuType);    // init binding.[menu, events] as empty value
    }
  }

  private extractIdAndEvent(contextMenu: ContextMenu): ClickEvents {
    interface MenuLeafItem { id: string; action: CallbackFunc; }

    // update clickEvents with actions of all leaf nodes in context menu
    const clickEvents: ClickEvents = {};
    recursivelyExtract(contextMenu).forEach(leaf => { clickEvents[leaf.id] = leaf.action; });
    return clickEvents;

    function recursivelyExtract(items: MenuItems): Array<MenuLeafItem> {
      const tmpEvents: Array<MenuLeafItem> = [];
      for (const item of items) {
        if (item.children === undefined || item.children.length === 0) {
          tmpEvents.push({ id: item.id, action: undefined });
        } else {
          recursivelyExtract(item.children).forEach(event => { tmpEvents.push(event); });
        }
      }
      return tmpEvents;
    }
  }
}


// ===== Type Definitions =====
interface MenuItem {
  id: string;
  children?: Array<MenuItem>;
}
type MenuItems = Array<MenuItem>;
export type ContextMenu = MenuItems;

interface EventInfo {
  cellView: joint.dia.CellView;
  event: JQuery.ContextMenuEvent;
  x: number;
  y: number;
}
type CallbackFunc = (eventInfo?: EventInfo) => void;
export interface ClickEvents {
  [key: string]: CallbackFunc;
}

interface ContextMenuInfo {
  paper: joint.dia.Paper;
  service: NzContextMenuService;
  component: NzDropdownMenuComponent;
}
interface CurrentInfo {
  menu: ContextMenu;
  events: ClickEvents;
  eventInfo: EventInfo;
}
interface BindingInfo {
  menu: {
    cell?: ContextMenu;
    link?: ContextMenu;
    element?: ContextMenu;
    blank?: ContextMenu;
  };
  events: {
    cell?: ClickEvents;
    link?: ClickEvents;
    element?: ClickEvents;
    blank?: ClickEvents;
  };
}

export enum MenuType {
  cell = 'cell',
  link = 'link',
  element = 'element',
  blank = 'blank'
}
