import Menu, { GridCoordinates, MenuChoiceItem } from './fce/menu.interface.js'
import {
    CONDUCTOR_GRID_LEFT,
    CONDUCTOR_GRID_RIGHT,
    CONDUCTOR_MENU_CHOICES,
} from './buz/00.menu.buzz.js'

export class MenuModel implements Menu {
    idx: string = '98.menu'
    activeSelection: string = ''
    lastActionTimestamp: number = 0
    statusMessage: string = 'IDLE'
    gridLeft: GridCoordinates = CONDUCTOR_GRID_LEFT
    gridRight: GridCoordinates = CONDUCTOR_GRID_RIGHT
    menuChoices: MenuChoiceItem[] = CONDUCTOR_MENU_CHOICES
}
