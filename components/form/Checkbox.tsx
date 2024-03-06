import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DropDownDisplayGroup, DropDownValueFunctionGroup } from "@/types/dropDown";

export default function Checkbox ({ val, fn, displayOptions }: {
    val: DropDownSearchOption
    fn: DropDownValueFunctionGroup
    displayOptions: DropDownDisplayGroup
}) {
    const updateValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { checked } = e.target;
        fn.onChange({
            name: displayOptions.name,
            value: checked
        }, displayOptions.name);
    }
    
    return (
        <div className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={val.value} onChange={updateValue} />
            {displayOptions.title && (
                <label>{displayOptions.title}</label>
            )}
        </div>
    )
}