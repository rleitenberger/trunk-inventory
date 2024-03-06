import LocationSearch from "./LocationSearch";
import ItemSearch from "./ItemSearch";
import { DropDownValueFunctionGroup } from "@/types/dropDown";
import { DropDownSearchOption } from "@/types/DropDownSearchOption";
import { DynamicInputField } from "@/types/dbTypes";
import Textarea from "./Textarea";
import Checkbox from "./Checkbox";
import Textbox from "./Textbox";
import React from "react";


function DynamicInputField({ fn, field, label }: {
    fn: DropDownValueFunctionGroup
    field: DynamicInputField
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
                            displayOptions={{
                                name: field.field_name,
                                title: label
                            }} />
            case 'itemSearch':
                return <ItemSearch
                            fn={fn} 
                            displayOptions={{
                                name:field.field_name,
                                title: label
                            }} />
            case 'locationSearch':
                return <LocationSearch
                            fn={fn}
                            displayOptions={{
                                name:field.field_name,
                                title: label
                            }} />
            case 'checkbox':
                return <Checkbox
                            fn={fn}
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

export default React.memo(DynamicInputField);