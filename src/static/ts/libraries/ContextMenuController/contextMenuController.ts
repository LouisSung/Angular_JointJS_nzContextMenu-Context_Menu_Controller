/**
 * @file [Library] Controller to generate context menu for JointJS paper
 * @author Louis Sung <ls@sysmaker.org> All Rights Reserved
 * @version v0.1.0
 * @licence MIT
 */

import * as joint from 'jointjs';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';

export class ContextMenuController {
  public get menu() { return this.contextMenu; }

  private readonly contextMenu: ContextMenu;
  private paper: joint.dia.Paper;
  private currentEvent: EventInfo;
  private clickEvents: ClickEvents = {};

  public onClick(id: string): void {
    const action = this.clickEvents[id];
    if (action !== undefined) {
      action(this.currentEvent);
    } else {
      console.error(`Event for context menu option "${id}" is undefined`);
    }
  }

  public bind(contextMenuInfo: ContextMenuInfo): void {
    this.paper = contextMenuInfo.paper;
    contextMenuInfo.paper.on('cell:contextmenu',
      (cellView: joint.dia.CellView, event: JQuery.ContextMenuEvent, x: number, y: number): void => {
        contextMenuInfo.service.create(event.originalEvent, contextMenuInfo.component);    // open menu
        this.currentEvent = { cellView, event, x, y };    // record event info for callback function
      });
  }
  public unbind(): void {
    this.paper.off('cell:contextmenu');
  }

  constructor(menuItems: MenuItems, clickEvents: ClickEvents) {
    this.contextMenu = menuItems;
    this.extractIdAndEvent();
    Object.assign(this.clickEvents, clickEvents);
  }

  private extractIdAndEvent() {
    // update clickEvents with actions of all leaf nodes in context menu
    extract(this.contextMenu).forEach(leaf => { this.clickEvents[leaf.id] = leaf.action; });

    interface Leaf { id: string; action: callbackFunc; }
    function extract(items: MenuItems): Array<Leaf> {
      const tmpEvents: Array<Leaf> = [];
      for (const item of items) {
        if (item.children === undefined || item.children.length === 0) {
          tmpEvents.push({ id: item.id, action: undefined });
        } else {
          extract(item.children).forEach(event => { tmpEvents.push(event); });
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
type callbackFunc = (eventInfo?: EventInfo) => void;
export interface ClickEvents {
  [key: string]: callbackFunc;
}

interface ContextMenuInfo {
  paper: joint.dia.Paper;
  service: NzContextMenuService;
  component: NzDropdownMenuComponent;
}
