import LocationSearch from "./LocationSearch";
import ItemSearch from "./ItemSearch";
import { DropDownValueFunctionGroup } from "@/types/dropDown";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DynamicInputField } from "@/types/dbTypes";
import Textarea from "./Textarea";
import Checkbox from "./Checkbox";
import Textbox from "./Textbox";


export default function DynamicInputField({ fn, field, val, label }: {
    fn: DropDownValueFunctionGroup
    field: DynamicInputField
    val: DropDownSearchOption
    label: string
}) {
    const GetComponent = () => {
        switch (field.field_type) {
            case 'textarea':
                return <Textarea
                            fn={fn}
                            displayOptions={{
                                name: field.field_name,
                                title: label
                            }} />
            case 'textbox': 
                return <Textbox
                            fn={fn}
                            val={val}
                            displayOptions={{
                                name: field.field_name,
                                title: label
                            }} />
            case 'itemSearch':
                return <ItemSearch
                            fn={fn} 
                            val={val} 
                            displayOptions={{
                                name:field.field_name,
                                title: label
                            }} />
            case 'locationSearch':
                return <LocationSearch
                            fn={fn}
                            val={val}
                            displayOptions={{
                                name:field.field_name,
                                title: label
                            }} />
            case 'checkbox':
                return <Checkbox
                            fn={fn}
                            val={val}
                            displayOptions={{
                                name:field.field_name,
                                title: label
                            }} />
            default:
                return (
                    <>
                        <label className="text-sm">{field.field_name}</label>
                    </>
                )
        }
    }

    return (
        <GetComponent />
    )

}