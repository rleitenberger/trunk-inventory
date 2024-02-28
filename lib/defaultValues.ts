import { DropDownSearchOption } from "@/types/DropDownSearchOption"
import { TransferOptions } from "@/types/TransferOptions"
import { TransferType } from "@/types/formTypes"

interface TransferOptionsCollection {
    transfer: TransferOptions<DropDownSearchOption>;
    remove: TransferOptions<DropDownSearchOption>;
    pull: TransferOptions<DropDownSearchOption>;
    return: TransferOptions<DropDownSearchOption>;
}


export const moveDefaults: TransferOptionsCollection = {
    transfer: {
        from: {
            name: 'Parts Room',
            value: 'd0223790-565d-440e-8667-5c05228afe33',
        },
        to: {
            name: '',
            value: ''
        },
        itemId: {
            name: '',
            value: ''
        },
        qty: {
            name: 'qty',
            value: 0
        },
        reasonId: {
            name: 'reasonId',
            value: ''
        },
        notes: {
            name: 'notes',
            value: ''
        },
        project: {
            name: 'projectId',
            value: ''
        }
    },
    remove: {
        from: {
            name: '',
            value: ''
        },
        to: {
            name: 'Parts Room',
            value: 'd0223790-565d-440e-8667-5c05228afe33',
        },
        itemId: {
            name: '',
            value: ''
        },
        qty: {
            name: 'qty',
            value: 0
        },
        reasonId: {
            name: 'reasonId',
            value: ''
        },
        notes: {
            name: 'notes',
            value: ''
        },
        project: {
            name: 'projectId',
            value: ''
        }
    },
    pull: {
        from: {
            name: 'Parts Room',
            value: 'd0223790-565d-440e-8667-5c05228afe33',
        },
        to: {
            name: 'Customer Location',
            value: '0aff29d1-d58e-11ee-b92b-4cd717dba858'
        },
        item: {
            name: '',
            value: ''
        },
        qty: {
            name: 'qty',
            value: 0
        },
        reasonId: {
            name: 'reasonId',
            value: ''
        },
        notes: {
            name: 'notes',
            value: ''
        },
        project: {
            name: 'projectId',
            value: ''
        }
    },
    return: {
        from: {
            name: 'Customer Location',
            value: '0aff29d1-d58e-11ee-b92b-4cd717dba858'
        },
        to: {
            name: 'Parts Room',
            value: 'd0223790-565d-440e-8667-5c05228afe33',
        },
        item: {
            name: '',
            value: ''
        },
        qty: {
            name: 'qty',
            value: 0
        },
        reasonId: {
            name: 'reasonId',
            value: ''
        },
        notes: {
            name: 'notes',
            value: ''
        },
        project: {
            name: 'projectId',
            value: ''
        }
    }
}