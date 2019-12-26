import { ClickEvents, ContextMenu, ContextMenuController } from '../../static/ts/libraries/ContextMenuController/contextMenuController';

const menuItems: ContextMenu = [
  { id: '1.1-childless' },
  { id: '1.2', children: [
      { id: '2', children: [
          { id: '3.1', children: [
              { id: '4', children: [
                  { id: '5', children: [
                      { id: '6-childless', },
                    ]},
                ]},
            ]},
          { id: '3.2', children: [
              { id: '4', children: [] },
            ]},
        ]},
    ]},
];
const clickEvents: ClickEvents = {
  '1.1-childless': () => console.log('a')
};

export const cellContextMenu = new ContextMenuController(menuItems, clickEvents);
