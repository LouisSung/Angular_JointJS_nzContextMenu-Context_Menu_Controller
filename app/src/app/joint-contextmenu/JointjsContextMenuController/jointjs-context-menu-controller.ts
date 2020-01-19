/**
 * @file [Library] Controller to generate NZ context menu for JointJS paper in Angular
 * @author Louis Sung <ls@sysmaker.org> All Rights Reserved
 * @version v2.0.0
 * @licence MIT
 */

import * as joint from 'jointjs';
import { NgStyle } from '@angular/common';
import { NgStyleInterface, NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';

/** Class that allows user to create context menus and bind corresponding actions */
export class JointjsContextMenuController {
  /**
   * For `html template` to render current menu
   * @return Current context menu (according to the click target (menuType))
   */
  public get contextMenu(): ContextMenu { return this.current.contextMenu; }

  /** Private member that help on storing runtime info */
  private current: CurrentInfo = {contextMenu: null, eventInfo: null};    // decided by the MenuType of target
  /** Private member that store bound info */
  private register: RegisterInfo = {
    paperSet: new Set<joint.dia.Paper>(),
    contextMenu: {cell: [], link: [], element: [], blank: []}
  };

  /**
   * CallbackFunc for `html template` to do the actual action
   * @param menuItem - The clicked menuItem
   * @param $eventOnMenuItem - Click event for menu item (the left click event)
   */
  public onClick(menuItem: MenuItem, $eventOnMenuItem?: MouseEvent): void {
    if (menuItem.disabled !== true) {    // make sure menuItem is not disabled
      const action = menuItem.action;
      if (action !== undefined) {    // make sure action has been defined
        this.current.eventInfo.menuItem = $eventOnMenuItem;
        action(this.current.eventInfo);    // pass current eventInfo to the callbackFunc (action) of menuItem
      } else {
        console.error(`ERR: Action for ITEM-"${menuItem.id}" is undefined`);
      }
    }
  }

  /**
   * To enable, disable, or toggle menu item for context menu (usually used in callbackFunc, e.g., disable after click once)
   * @param targetId - ID of target menu item
   * @param menuType - Target context menu (MenuType.[cell, element, link, or blank])
   * @param setAsDisabled - Set as "true" to disable, "false" to enable, and "leave empty" to toggle (foo = !foo)
   * @return Return "true" if target menu item is found, "false" if not found (e.g., error ID is given)
   */
  public disableMenuItem(targetId: string, menuType?: MenuType, setAsDisabled?: boolean): boolean {
    return this.findMenuItemById(targetId, menuType && this.register.contextMenu[menuType],
      (menuItem: MenuItem) => { menuItem.disabled = (setAsDisabled === undefined) ? !menuItem.disabled : setAsDisabled; });
  }

  /**
   * To bind context menu config on target paper(s)
   * @param paper - Either 1 paper or multiple papers in an array (note that one paper can only be bound once before unbind)
   */
  public bindPaper(paper: joint.dia.Paper | Array<joint.dia.Paper>): void {
    if (this.register.init !== undefined) {
      const filteredPaper = (Array.isArray(paper) ? paper : [paper]).filter(    // prevent same paper from bind multiple times
        (tmpPaper) => this.register.paperSet.has(tmpPaper) ? false : Boolean(this.register.paperSet.add(tmpPaper)));

      for (const targetPaper of filteredPaper) {
        for (const menuType of Object.values(MenuType)) {
          if (this.register.contextMenu[menuType].length > 0) {
            // targetPaper.off(`${menuType}:contextmenu`);
            targetPaper.on(`${menuType}:contextmenu`, (menuType === MenuType.blank) ?
              (event, x, y): void  => { rightClick(MenuType.blank, event, x, y); } :    // "blank" events have no cellView
              (cellView, event, x, y): void => { rightClick(menuType, event, x, y, cellView); }    // cell, element, or link
            );
          }}}
    } else {
      console.error('ERR: Function "bindPaper()" should be called after "bindAngular()"');
    }
    /** Inner function. Extracted because events for MenuType.blank have no cellView, which are different from other types */
    const rightClick = (menuType: MenuType, event: JQuery.ContextMenuEvent, x: number, y: number, cellView?: joint.dia.CellView) => {
      this.current.contextMenu = this.register.contextMenu[menuType];    // update context menu in `.html` by menuType
      this.current.eventInfo = {cellView, joint: event, x, y, menuItem: null};    // record event info for callback function
      this.register.init.nzContextMenuService.create(event.originalEvent, this.register.init.nzDropdownMenuComponent);
    };
  }

 /**
  * Reserved function. For user to unbind bound right click events as needed
  * @param [paper] - Target paper to unbind right click event
  * @param [menuType] - Leave empty to unbind both 4 types of menuType (cell, element, link, and blank)
  */
  public unbindPaper(paper?: joint.dia.Paper | Array<joint.dia.Paper>, menuType?: MenuType): void {
    if (this.register.init !== undefined) {
      const targetPaperList = (paper === undefined) ? this.register.paperSet : (Array.isArray(paper) ? paper : [paper]);
      const targetMenuTypeList = (menuType !== undefined) ? [menuType] : Object.values(MenuType);
      for (const unbindPaper of targetPaperList) {
        for (const unbindType of targetMenuTypeList) {
          unbindPaper.off(`${unbindType}:contextmenu`);
        }}

      // clear registered papers after unbind
      if (menuType === undefined) { targetPaperList.forEach(this.register.paperSet.delete, this.register.paperSet); }
    } else {
      console.error('ERR: Try to unbind before bound (call "bindAngular()" within ngAfterViewInit in "*.component.ts" first)');
    }
  }

  /**
   * For `Angular Component` to bind all required info. Must be called within `ngAfterViewInit()` in file `*.component.ts`
   * @param nzContextMenuService - NZ Service that handle (create and close) context menu
   * @param nzDropdownMenuComponent - NZ Component for drop-down menu (context menu)
   */
  public bindAngular(nzContextMenuService: NzContextMenuService, nzDropdownMenuComponent: NzDropdownMenuComponent): void {
    if (nzDropdownMenuComponent !== undefined) {
      this.register.init = {nzContextMenuService, nzDropdownMenuComponent};
    } else {
      console.error('ERR: Function "init()" should be called within "ngAfterViewInit()" in "*.component.ts"');
    }
  }

  /**
   * To bind `Predefined Context Menu`.
   * User should predefine context menus with actions in separated `.ts` file, and then import it into `*.component.ts`.
   * Therefore, Component in Angular is not responsible for content and actions of context menus
   * @param menuType - Should be either MenuType.[cell, element, link, or blank]
   * @param contextMenuWithAction - Bind or update context menu (with action for leaf menuItems)
   */
  public bindContextMenuAndAction(menuType: MenuType, contextMenuWithAction: ContextMenu): void {
    this.register.contextMenu[menuType] = contextMenuWithAction;

    if (this.register.contextMenu[menuType].length > 0) {    // check action for each leafMenuItem
      for (const [id, action] of Object.entries(extractMenuAction(this.register.contextMenu[menuType]))) {
        if (action === undefined) {    // remind user that some of actions have not been defined yet
          console.warn(`WARN: Action for ITEM-"${id}" in MENU-"${menuType}" should be defined`);
        }}}

    // inner function
    function extractMenuAction(contextMenu: ContextMenu): { [key: string]: MenuLeaf['action']; } {
      // turn `[{id1, action1}, {id2, action2} ...]` into `{id1: action1, id2: action2 ...}`
      return recursivelyExtractMenuLeaf(contextMenu).reduce((pre, cur) => ({...pre, [cur.id]: cur.action}), {});

      // nested function
      function recursivelyExtractMenuLeaf(menuItemList: ContextMenu | Array<MenuItem>): Array<MenuLeaf> {
        const tmpMenuLeafList: Array<MenuLeaf> = [];
        for (const menuItem of menuItemList) {
          if (menuItem.children === undefined || menuItem.children.length === 0) {
            tmpMenuLeafList.push({id: menuItem.id, action: menuItem.action});
          } else {
            recursivelyExtractMenuLeaf(menuItem.children).forEach(
              (leafMenuItem) => { tmpMenuLeafList.push({id: leafMenuItem.id, action: leafMenuItem.action}); });
          }
        }
        return tmpMenuLeafList;
      }
    }
  }

  /**
   * To find menu item by the given id
   * @param targetId: Target id
   * @param contextMenu: Find in given context menu (leave empty to find in all menu)
   * @param callbackFunc: Callback function when menu item is found
   */
  public findMenuItemById(targetId: string, contextMenu?: ContextMenu, callbackFunc?: (menuItem: MenuItem) => void): boolean {
    if (contextMenu !== undefined) {
      return recursivelyFindMenuItem(contextMenu);
    } else {
      for (const targetContextMenu of Object.values(this.register.contextMenu).reverse()) {
        if (recursivelyFindMenuItem(targetContextMenu) === true) { return true; }
      }
      return false;
    }

    // inner function
    function recursivelyFindMenuItem(menuItemList: ContextMenu | Array<MenuItem>): boolean {
      let isFound = false;
      for (const item of menuItemList) {
        if (item.id === targetId) {
          if (callbackFunc instanceof Function) { callbackFunc(item); }
          isFound = true;
        } else if (item.children !== undefined && item.children.length > 0) {
          isFound = recursivelyFindMenuItem(item.children);
        }
        if (isFound === true) { return isFound; }
      }
      return isFound;
    }
  }
}

// ===== Type Definitions =====
export interface MenuItem {
  id: string;
  display?: string;    // for display (replace id)
  title?: string;    // for tooltip when hovered
  style?: { menu?: NgStyle['ngStyle']; title?: NgStyleInterface; };
  disabled?: boolean;
  children?: Array<MenuItem>;
  action?: (eventInfo?: EventInfo) => void;
}
export type ContextMenu = Array<MenuItem>;
interface MenuLeaf { id: MenuItem['id']; action: MenuItem['action']; }

/** Event info provided by `joint.dia.Paper.on` callback function when user right click */
interface EventInfo {
  cellView: joint.dia.CellView;
  joint: JQuery.ContextMenuEvent;
  x: number;
  y: number;
  menuItem: MouseEvent;
}

/** Runtime info for context menu rendering, event triggering, and event providing */
interface CurrentInfo {
  contextMenu: ContextMenu;
  eventInfo: EventInfo;
}

/** Registered info (including bound papers, predefined menus, required info of Angular */
interface RegisterInfo {
  paperSet: Set<joint.dia.Paper>;
  contextMenu: RegisterContextMenu;
  init?: {
    nzContextMenuService: NzContextMenuService;
    nzDropdownMenuComponent: NzDropdownMenuComponent;
  };
}
interface RegisterContextMenu extends Record<MenuType, ContextMenu> {}

/** Four types of context menu events provide by JointJS */
export enum MenuType {
  cell = 'cell',
  link = 'link',
  element = 'element',
  blank = 'blank'
}
