import {
  ClickEvents, ContextMenu, ContextMenuController, MenuType
} from '../../static/ts/libraries/ContextMenuController/contextMenuController';

interface MenuAndEvents {
  menu: ContextMenu;
  events: ClickEvents;
}

/**
 * Predefined menus and events (cell, element, link, and blank)
 */
/** Menu and events for cell (both element (vertex) and link (edge)) */
const cell: MenuAndEvents = {
  menu: [
    {id: '1.1-cell1'},
    {id: '1.2-cell', children: [
        {id: '2.1-cell2'},
        {id: '2.2-cell', children: [
            {id: '3.1-cell3', children: []},    // empty children will be treated as childless too
            {id: '3.2-cell4'}
          ]},
        {id: '2.3-cell5'},
      ]},
    {id: '1.3-cell6', title: '1.3-cell6-show title instead of id'},
    {id: '1.4-cell7-disabled-item', disabled: true},
    {id: '1.5-cell8-disabled-submenu', disabled: true, children: [{id: '2.4-cell8-unreachable'}]},
    {id: '1.6-cell9-disabled-after-click'},
    {id: '1.7-cell10-toggle-disabled', title: '1.7-cell-toggle disabled status for "1.6-cell"'},
    {id: '1.8-cell11-inner-html', title: '1.8-cell11-inner-html-<span class="_red">example</span>'}
  ],
  events: {
    // Remind when init - WARN: Event for ITEM-"1.1-cell1" in MENU-"cell" should be defined
    // Warn after right click - ERR: Event for ITEM-"1.1-cell1" is undefined
    // '1.1-cell1': () => console.log('cell1'),    // comment out to show warning and error
    '2.1-cell2': () => console.log('cell2'),    // eventInfo is not required (doesn't pass)
    '3.1-cell3': (eventInfo) => console.log('cell3 - X: ', eventInfo.x),
    '3.2-cell4': (eventInfo) => console.log('cell4 - Y: ', eventInfo.y),
    '2.3-cell5': (eventInfo) => console.log('cell5 - Event: ', eventInfo.joint),
    '1.3-cell6': (eventInfo) => console.log('cell6 - CellView: ', eventInfo.cellView),
    '1.4-cell7-disabled-item': () => console.error('Should not be triggerable'),
    '2.4-cell8-unreachable': () => console.error('I am triggerable but you cannot even see me'),
    '1.6-cell9-disabled-after-click': () => console.log(
      contextMenu.disableMenuItem(MenuType.cell, '1.6-cell9-disabled-after-click', true)),
    '1.7-cell10-toggle-disabled': () => contextMenu.disableMenuItem(MenuType.cell, '1.6-cell9-disabled-after-click'),
    '1.8-cell11-inner-html': (eventInfo) => {
      console.log('cell11 - Change innerHTML to green temporarily: ', eventInfo.menuItem.target);
      (eventInfo.menuItem.target as HTMLElement).innerHTML = '1.8-cell11-inner-html-<span class="_green">example-temp</span>';
    }
  }
};

/** NO menu and events will bind to element (use cell events instead (if there exists a bound one)) */
const element: MenuAndEvents = {menu: [], events: {}};    // or just don't declare and bind anything

/** TWO events will be trigger if both "cell" and "element or link" are bound */
const link = {
  menu: [{id: '1-link'}],
  events: {'1-link': (eventInfo) => {
    console.log('Both events for "open context menu" for "element" and "link" will be triggered when right click');
    console.log('However, the the element menu will be replaced link menu (later one)');
    console.warn('If you want to have different menu or events for "element" and "link", ' +
      'DO NOT bind to "cell", but to "element" and "link" separately instead');
  }}
};

/** NO CellView for blank menu */
const blank: MenuAndEvents = {
  menu: [
    {id: '1.1-blank1'},
    {id: '1.2-blank2'},
    {id: '1.3', children: [
        {id: '2', children: [
            {id: '3.1', children: [
                {id: '4.1', children: [
                    {id: '5', children: [
                        {id: '6.1-blank3'},
                        {id: '6.2-blank4'}
                      ]},
                  ]},
              ]},
            {id: '3.2', children: [
                {id: '4.2-blank5'}
              ]},
          ]},
      ]}
  ],
  events: {
    '1.1-blank1': (eventInfo) => console.log('blank1 - No CellView: ', eventInfo.cellView),
    '1.2-blank2': () => console.log('blank2'),
    '6.1-blank3': () => console.log('blank3'),
    '6.2-blank4': () => console.log('blank4'),
    '4.2-blank5': () => console.log('blank5')
  }
};

/**
 * Expose contextMenu to "*.component.ts" with all predefined menus and corresponding events
 */
export const contextMenu = new ContextMenuController();
contextMenu.bindContextMenuWithEvents(MenuType.cell, cell.menu, cell.events);
contextMenu.bindContextMenuWithEvents(MenuType.element, element.menu, element.events);
contextMenu.bindContextMenuWithEvents(MenuType.link, link.menu, link.events);
contextMenu.bindContextMenuWithEvents(MenuType.blank, blank.menu, blank.events);
