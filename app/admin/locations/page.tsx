'use client';

import AdminNav from "@/components/AdminNav";
import Loader from "@/components/Loader";
import EditableText from "@/components/form/EditableText";
import useOrganization from "@/components/providers/useOrganization";
import { createLocation, deleteLocation, updateLocationName } from "@/graphql/mutations";
import { getLocations } from "@/graphql/queries";
import { Location } from "@/types/dbTypes";
import { useApolloClient } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { AiFillMinusCircle } from "react-icons/ai";
import { BiCheck, BiPlus } from "react-icons/bi";

export default function PageAdminLocations ({  }) {

    const orgId = useOrganization();
    const apolloClient = useApolloClient();

    const [locationName, setLocationName] = useState<string>('');
    const updateAddLocationName = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setLocationName(e.target.value);
    }

    const [isAddingLocation, setIsAddingLocation] = useState<boolean>(false);
    const updateIsAddingLocation = (): void => {
        setIsAddingLocation((prev: boolean): boolean => {
            if (!prev) {
                setLocationName('');
            }
            return !prev;
        });
    }

    const [isLoadingLocations, setIsLoadingLocations] = useState<boolean>(true);

    const [locations, setLocations] = useState<Location[]>([]);

    const addLocation = async (): Promise<void> => {
        const { data } = await apolloClient.mutate({
            mutation: createLocation,
            variables: {
                organizationId: orgId,
                locationName: locationName
            }
        });

        if (!data?.createLocation){
            console.error('Location was not added');
            return;
        }

        setLocations([
            ...locations,
            data.createLocation
        ]);

        setLocationName('');
    }

    const removeLocation = async (locationId: string): Promise<void> => {
        const { data } = await apolloClient.mutate({
            mutation: deleteLocation,
            variables: {
                locationId: locationId
            }
        });

        if (!data?.deleteLocation) {
            console.error('Location was not deleted');
            return;
        }

        setLocations((prev: Location[]): Location[] => {
            return prev.filter((e: Location) => {
                return e.location_id !== locationId;
            })
        });
    }

    useEffect(() => {
        async function fetchLocations() {
            const { data } = await apolloClient.query({
                query: getLocations,
                variables: {
                    organizationId: orgId
                },
                fetchPolicy: 'network-only'
            });

            setIsLoadingLocations(false);

            if (!data?.getLocations){
                console.error('Could not get locations');
                return;
            }

            setLocations(data.getLocations);
        }

        fetchLocations();
    }, []);

    const addingLocationRotation = useMemo((): string => {
        return isAddingLocation ? 'rotate-45' : 'rotate-0';
    }, [isAddingLocation]);

    const modifyLocationName = async (newName: string, locationId: string): Promise<boolean> => {
        const { data } = await apolloClient.mutate({
            mutation: updateLocationName,
            variables: {
                locationId: locationId,
                locationName: newName
            }
        });

        if (!data?.updateLocationName){
            console.error('Location name was not updated');
            return false;
        }

        const locationIdx = locations.map((e: Location) => e.location_id).indexOf(locationId);
        if (locationIdx === -1){
            console.error('Could not find location');
            return false;
        }

        setLocations((prev: Location[]): Location[] => {
            const tmp = prev.map((e: Location): Location => {
                return { 
                    ...e
                }
            })

            tmp[locationIdx].name = newName;
            return tmp;
        });

        return true;
    }

    return (
        <>
            <AdminNav pageName="locations" />
            
            {isLoadingLocations ? (
                <div className="flex items-center justify-center w-full h-full">
                    <Loader size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 md:col-span-6">

                        <div className="flex items-center ">
                            <h1 className="font-medium my-2 text-lg">Locations</h1>
                            <button onClick={updateIsAddingLocation} className="rounded-lg p-2 ml-auto hover:bg-slate-300/40 transition-colors">
                                <BiPlus className={`${addingLocationRotation} transition-all duration-150`} />
                            </button>
                        </div>
                        {isAddingLocation && (
                            <div>
                                <label className="text-sm">Location name</label>
                                <div className="flex items-center gap-2">
                                    <input type="text" value={locationName} onChange={updateAddLocationName} placeholder="Enter location name"
                                        className="outline-none border border-slate-300 rounded-lg px-2 py-1 text-sm flex-1" />
                                    <button onClick={addLocation} className=" bg-green-500 hover:bg-green-600 rounded-md p-2
                                        transition-colors duration-150 text-white">
                                        <BiCheck className="" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {locations?.length ? (
                            <div className="grid grid-cols-12 gap-2">
                                {locations.map((e: Location) => {
                                    return (
                                        <div key={`l-${e.location_id}`} className="text-sm grid grid-cols-12 col-span-12">
                                            <div className="col-span-1">
                                                <button className="transition-colors p-2 rounded-lg hover:bg-slate-300/40 outline-none"
                                                    onClick={()=>{
                                                        removeLocation(e.location_id)
                                                    }}>
                                                    <AiFillMinusCircle className="text-red-500" />
                                                </button>
                                            </div>
                                            <div className="col-span-11 flex items-center">
                                                <EditableText
                                                    label="Location name"
                                                    val={e.name}
                                                    fn={{
                                                        onSave: (value) => {
                                                            return modifyLocationName(value, e.location_id)
                                                        }
                                                    }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-center text-slate-600 font-medium">No locations have been added yet</p>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}