import {  ContextMenu, JointjsContextMenuController, MenuType } from './jointjs-context-menu-controller';


/**
 * Predefined menus and events (cell, element, link, and blank)
 */
/** Menu and events for cell (both element (vertex) and link (edge)) */
const cell: ContextMenu = [
  {id: '1.1-cell1', style: {menu: {color: 'blue'}}, title: 'Tooltip'},
  {id: '1.2-cell', children: [
      {id: '2.1-cell2', action: () => console.log('cell2')},
      {id: '2.2-cell', children: [
          // empty children will be treated as childless too
          {id: '3.1-cell3', children: [], action: (eventInfo) => console.log('cell3 - X: ', eventInfo.x)},
          {id: '3.2-cell4', action: (eventInfo) => console.log('cell4 - Y: ', eventInfo.y)}
        ]},
      {id: '2.3-cell5', action: (eventInfo) => console.log('cell5 - Event: ', eventInfo.joint)},
    ]},
  {
    id: '1.3-cell6', display: '1.3-cell6-show display instead of id',
    action: (eventInfo) => console.log('cell6 - CellView: ', eventInfo.cellView)
  },
  {id: '1.4-cell7-disabled-item', disabled: true, action: () => console.error('Should not be triggerable')},
  {
    id: '1.5-cell8-disabled-submenu', disabled: true,
    children: [{id: '2.4-cell8-unreachable',  action: () => console.error('I am triggerable but you cannot even see me')}]
  },
  {
    id: '1.6-cell9-disabled-after-click', action: () => console.log(
      contextMenu.disableMenuItem('1.6-cell9-disabled-after-click', MenuType.cell, true))
  },
  {
    id: '1.7-cell10-toggle-disabled', display: '1.7-cell-toggle disabled status for "1.6-cell"',
    action: () => contextMenu.disableMenuItem('1.6-cell9-disabled-after-click', MenuType.cell)
  },
  {
    id: '1.8-cell11-inner-html', display: '1.8-cell11-inner-html-<span class="_red">example</span>',
    action: (eventInfo) => {
      console.log('cell11 - Change innerHTML to green temporarily: ', eventInfo.menuItem.target);
      (eventInfo.menuItem.target as HTMLElement).innerHTML = '1.8-cell11-inner-html-<span class="_green">example-temp</span>';
    }
  }
];

/** NO menu and events will bind to element (use cell events instead (if there exists a bound one)) */
const element: ContextMenu = [];    // or just don't declare and bind anything

/** TWO events will be trigger if both "cell" and "element or link" are bound */
const link: ContextMenu = [
  {id: '1-link', action: (eventInfo) => {
      console.log('Both events for "open context menu" for "element" and "link" will be triggered when right click');
      console.log('However, the the element menu will be replaced link menu (later one)');
      console.warn('If you want to have different menu or events for "element" and "link", ' +
        'DO NOT bind to "cell", but to "element" and "link" separately instead');
    }}
];

/** NO CellView for blank menu */
const blank: ContextMenu = [
  {id: '1.1-blank1', action: (eventInfo) => console.log('blank1 - No CellView: ', eventInfo.cellView)},
  {id: '1.2-blank2', action: () => console.log('blank2')},
  {id: '1.3', children: [
      {id: '2', children: [
          {id: '3.1', children: [
              {id: '4.1', children: [
                  {id: '5', children: [
                      {id: '6.1-blank3', action: () => console.log('blank3')},
                      {id: '6.2-blank4', action: () => console.log('blank4')}
                    ]},
                ]},
            ]},
          {id: '3.2', children: [
              {id: '4.2-blank5', action: () => console.log('blank5')}
            ]},
        ]},
    ]}
];

/**
 * Expose contextMenu to "*.component.ts" with all predefined menus and corresponding events
 */
export const contextMenu = new JointjsContextMenuController();
contextMenu.bindContextMenuAndAction(MenuType.cell, cell);
contextMenu.bindContextMenuAndAction(MenuType.element, element);
contextMenu.bindContextMenuAndAction(MenuType.link, link);
contextMenu.bindContextMenuAndAction(MenuType.blank, blank);
