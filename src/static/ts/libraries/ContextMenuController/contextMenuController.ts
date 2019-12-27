/**
 * @file [Library] Controller to generate context menu for JointJS paper
 * @author Louis Sung <ls@sysmaker.org> All Rights Reserved
 * @version v0.3.0
 * @licence MIT
 */

import * as joint from 'jointjs';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';

/** Class that allows user to create context menus and bind corresponding events */
export class ContextMenuController {
  /**
   * For `html template` to render current menu
   * @return Current context menu (according to the click target (event type))
   */
  public get menu(): ContextMenu { return this.current.menu; }

  /** Private members that help on storing runtime info */
  private menuInfo: ContextMenuInfo;    // record event binding target (paper)
  private current: CurrentInfo = {menu: null, events: null, eventInfo: null};    // decided by the MenuType of target
  private binding: BindingInfo = {menu: {}, events: {}};    // context menu and events list for each MenuType

  /**
   * Callback function for `html template` to do the actual action
   * @param id - The target id (title) for lookup table to find out the corresponding event (action)
   */
  public onClick(id: string): void {
    const action = this.current.events[id];
    if (action !== undefined) {
      action(this.current.eventInfo);    // pass current "event info" to menu option callback function
    } else {
      console.error(`ERR: Event for OPTION-"${id}" is undefined`);
    }
  }

  /**
   * To enable, disable, or toggle menu item for context menu (usually used in callback events, e.g., disable after click once)
   * @param menuType - Target context menu (MenuType.[cell, element, link, or blank])
   * @param targetId - ID of target menu item
   * @param setAsDisabled - Set as "true" to disable, "false" to enable, and "leave empty" to toggle (foo = !foo)
   * @return Return "true" if target menu item is found, "false" if not found (e.g., error ID is given)
   */
  public disableMenuItem(menuType: MenuType, targetId: string, setAsDisabled?: boolean): boolean {
    return(recursivelyFind(this.binding.menu[menuType]));

    function recursivelyFind(items: Array<MenuItem>): boolean {
      let isFound = false;
      for (const item of items) {
        if (item.id === targetId) {
          item.disabled = (setAsDisabled === undefined) ? !item.disabled : setAsDisabled;
          isFound = true;
        } else if (item.children !== undefined && item.children.length > 0) {
          isFound = recursivelyFind(item.children);
        }
        if (isFound === true) { break; }
      }
      return isFound;
    }
  }

  /**
   * For `Component` to bind all required info. Must be called within `ngAfterViewInit()` in file `*.component.ts`
   * @param contextMenuInfo - Required info, i.e., Target Paper, nzContextMenuService, and Menu Template
   */
  public bind(contextMenuInfo: ContextMenuInfo): void {
    if (contextMenuInfo.component !== undefined) {
      this.menuInfo = contextMenuInfo;
      for (const menuType of [MenuType.cell, MenuType.element, MenuType.link, MenuType.blank]) {
        if (this.binding.menu[menuType].length > 0) {
          // console.log(`INFO: Bind event "paper.on.${menuType}:contextmenu"`);    // check binding event type
          this.menuInfo.paper.on(`${menuType}:contextmenu`, (menuType === MenuType.blank) ?
            (event, x, y): void  => { callbackFunc(MenuType.blank, event, x, y); } :    // "blank" events have no cellView
            (cellView, event, x, y): void => { callbackFunc(menuType, event, x, y, cellView); }    // cell, element, or link
          );
        }
      }
    } else {
      console.error('ERR: Function "bind()" should be called within "ngAfterViewInit()" in "*.component.ts"');
    }
    /** Nested function. Extracted because events for MenuType.blank have no cellView, which are different from other types */
    const callbackFunc = (menuType: MenuType, event: JQuery.ContextMenuEvent, x: number, y: number, cellView?: joint.dia.CellView) => {
      this.current.menu = this.binding.menu[menuType];    // update context menu in `.html` by menuType
      this.current.events = this.binding.events[menuType];    // update events with corresponding menuType
      this.menuInfo.service.create(event.originalEvent, this.menuInfo.component);    // open context menu
      this.current.eventInfo = {cellView, event, x, y};    // record event info for callback function
    };
  }

  /**
   * Reserved function. For user to unbind bound events as needed
   * @param [menuType] - Leave empty to unbind both 4 types of events (cell, element, and link, blank)
   */
  public unbind(menuType?: MenuType): void {
    if (this.menuInfo === undefined) {
      console.error('ERR: Try to unbind before bound (call "bind()" in "*.component.ts" first)');
    } else {
      const unbindTarget = (menuType !== undefined) ? [menuType] : [MenuType.cell, MenuType.element, MenuType.link, MenuType.blank];
      for (const unbind of unbindTarget) {
        console.log(`INFO: Unbind event "paper.on.${unbind}:contextmenu"`);
        this.menuInfo.paper.off(`${unbind}:contextmenu`);
      }
    }
  }

  /**
   * For `Predefined Context Menu`. User should predefine context menus and events in separated `.ts` file, and then
   *   import it into `*.component.ts`. Therefore, Component is not responsible for content and events of context menus
   * @param menuType - Should be either MenuType.[cell, element, link, or blank]
   * @param contextMenu - Update context menu. Leave empty to keep old menu (e.g., use to update click events only)
   * @param clickEvents - Update click events. Leave empty to keep old events (e.g., update menu only) (rarely used)
   */
  public bindContextMenuWithEvents(menuType: MenuType, contextMenu?: ContextMenu, clickEvents?: ClickEvents) {
    // update as new values if given, keep old values if not given, and init as empty if there's no old value
    // pass contextMenu as [] or clickEvents as {} to manually clear up old values
    this.binding.menu[menuType] = contextMenu || this.binding.menu[menuType] || [];
    this.binding.events[menuType] = clickEvents || this.binding.events[menuType] || {};

    if (this.binding.menu[menuType].length > 0) {
      // extract click event list from the recorded context menu
      const expectedEvents = this.extractIdAndEvent(this.binding.menu[menuType]);
      Object.assign(expectedEvents, this.binding.events[menuType]);    // update expectedEvents with binding events
      for (const [id, event] of Object.entries(expectedEvents)) {
        if (event === undefined) {    // remind user that some of events are not defined yet
          console.warn(`WARN: Event for OPTION-"${id}" in MENU-"${menuType}" should be defined`);
        }
      }
      this.binding.events[menuType] = expectedEvents;
    }
  }

  /**
   * Initialize
   */
  constructor() {
    for (const menuType of Object.values(MenuType)) {
      this.bindContextMenuWithEvents(menuType);    // init binding.[menu, events] as empty value
    }
  }

  /**
   * Extract all leaf options (which should have bound event) in the menu in order to do the following checking
   * @param contextMenu - The target menu
   * @return Expected event list with `id only` (undefined action)
   */
  private extractIdAndEvent(contextMenu: ContextMenu): ClickEvents {
    interface MenuLeafItem { id: string; action: CallbackFunc; }

    // update clickEvents with actions of all leaf nodes in context menu
    const clickEvents: ClickEvents = {};
    recursivelyExtract(contextMenu).forEach(leaf => { clickEvents[leaf.id] = leaf.action; });
    return clickEvents;

    function recursivelyExtract(items: Array<MenuItem>): Array<MenuLeafItem> {
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
  disabled?: boolean;
  children?: Array<MenuItem>;
  title?: string;
}
export type ContextMenu = Array<MenuItem>;

/** Event info provided by `joint.dia.Paper.on` callback function when user right click */
interface EventInfo {
  cellView: joint.dia.CellView;
  event: JQuery.ContextMenuEvent;
  x: number;
  y: number;
}
type CallbackFunc = (eventInfo?: EventInfo) => void;    // user can decide whether to use the event info or not
export interface ClickEvents {
  [key: string]: CallbackFunc;
}

/** Context menu info provided by `*.component.ts` */
interface ContextMenuInfo {
  paper: joint.dia.Paper;
  service: NzContextMenuService;
  component: NzDropdownMenuComponent;
}
/** Runtime info for context menu rendering, event triggering, and event providing */
interface CurrentInfo {
  menu: ContextMenu;
  events: ClickEvents;
  eventInfo: EventInfo;
}
/** Binding info to record predefined menus and corresponding events */
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

/** Four types of context menu events provide by */
export enum MenuType {
  cell = 'cell',
  link = 'link',
  element = 'element',
  blank = 'blank'
}
