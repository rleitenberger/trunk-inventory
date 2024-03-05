import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DropDownValueFunctionGroup } from "@/types/dropDown";

export default function Textarea ({ val, fn, name }: {
    val: DropDownSearchOption
    fn: DropDownValueFunctionGroup
    name: string
}) {
    const updateValue = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        fn.onChange({
            name: name,
            value: e.target.value
        }, name);
    }
    
    return (
        <textarea className="px-2 py-1 border border-slate-300 rounded-lg"
            value={val.value} onChange={updateValue}></textarea>
    )
}