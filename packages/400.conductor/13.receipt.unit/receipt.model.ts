import Receipt, { EpisodeStackReceipt } from './fce/receipt.interface.js'
import ReceiptBit from './fce/receipt.interface.js'

export class ReceiptModel implements Receipt {
    idx: string = '13.receipt'
    receiptBitList: ReceiptBit[] = []
    receiptBits: Record<string, unknown> = {}
    lastReceipt: EpisodeStackReceipt | null = null
}
