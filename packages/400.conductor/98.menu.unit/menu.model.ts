import Menu from './fce/menu.interface.js'

export class MenuModel implements Menu {
    idx: string = '98.menu.unit'
    activeSelection: string = 'NONE'
    lastActionTimestamp: number = 0
    statusMessage: string = 'IDLE'
}
