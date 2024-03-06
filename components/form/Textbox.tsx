import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown";

export default function Textbox ({ val, fn, displayOptions }: {
    val: DropDownSearchOption
    fn: DropDownValueFunctionGroup
    displayOptions: DropDownDisplayGroup
}) {
    const updateValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
        fn.onChange({
            name: displayOptions.name,
            value: e.target.value
        }, displayOptions.name);
    }
    
    return (
        <div className="text-sm">
            {displayOptions.title && (
                <label>{displayOptions.title}</label>
            )}
            <div>
                <input className="px-2 py-1 border border-slate-300 rounded-lg"
                    value={val.value} onChange={updateValue} />
            </div>
        </div>
    )
}