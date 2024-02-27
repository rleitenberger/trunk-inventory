import { useState } from "react";
import LocationSearch from "./LocationSearch";
import { ApolloClient } from "@apollo/client";
import useOrganization from "../providers/useOrganization";
import ItemSearch from "./ItemSearch";

export default function DynamicInputField({ fieldType, fieldName, onChange, apolloClient,
    organizationId }: {
    fieldType: string;
    fieldName: string;
    onChange: CallableFunction
    apolloClient: ApolloClient<object>
    organizationId: string
}) {
    const [val, setVal] = useState<string>('');

    const handleOnNullChange = (newValue: string|null, name:string): any => {
        updateVal(newValue === null ? '' : newValue);
    }

    const updateVal = (newValue: string): any => {
        setVal(newValue);
    }

    const GetComponent = () => {
        switch (fieldType) {
            case 'textarea':
                break;
            case 'itemSearch':
                return <ItemSearch name={fieldName} apolloClient={apolloClient} organizationId={organizationId}
                    onChange={handleOnNullChange} title={fieldName} />
            case 'locationSearch':
                return <LocationSearch name={fieldName} apolloClient={apolloClient} organizationId={organizationId}
                    onChange={handleOnNullChange} title={fieldName} />
            default:
                return (
                    <>
                        <label className="text-sm">{fieldName}</label>
                        <input type='text' value={val} onChange={(e) => {
                            updateVal(e.target.value)
                        }} />
                    </>
                )
        }
    }

    return (
        <GetComponent />
    )

}