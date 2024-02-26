import { useState } from "react";
import Modal from "./Modal";

export default function CreateItemModal ({ defaultName }: {
    defaultName?: string
}) {
    const [itemOptions, setItemOptions] = useState({
        name: defaultName ?? '',
        sku: '',
        description: ''
    });

    const [showing, setShowing] = useState<boolean>(false);
    const hideModal = ():void => {
        setShowing(false);
    }

    const updateItemFields = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setItemOptions({
            ...itemOptions,
            [name]: value
        });
    }

    return (
        <Modal
            showing={showing}
            hide={hideModal}
            title='Create Item'>
            <div className="text-sm">
                <div>
                    <label>Item Name</label>
                    <input type="text" name="name" value={itemOptions.name} onChange={updateItemFields}
                        className="px-2 py-1 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                    <label>SKU</label>
                    <input type="text" name="sku" value={itemOptions.sku} onChange={updateItemFields}
                        className="px-2 py-1 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                    <label>Description</label>
                    <input type="text" name="description" value={itemOptions.description} onChange={updateItemFields}
                        className="px-2 py-1 border border-slate-300 rounded-lg outline-none" />
                </div>
            </div>
        </Modal>
    )
}