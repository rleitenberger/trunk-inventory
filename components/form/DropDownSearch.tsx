import { useState, useRef, useEffect, useMemo } from 'react';
import { BiSearch } from 'react-icons/bi';
import type { DropDownSearchOption } from '@/types/DropDownSearchOption';

const MAX_DISPLAY: number = 10;

export default function DropDownSearch({ refetch, onChange, name }: {
    refetch: (search: string) => Promise<any>
    onChange: (value: string, name: string) => void,
    name: string
}) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedOption, setSelectedOption] = useState<DropDownSearchOption<any>>({
        name: '',
        value: '',
        object: {}
    });
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const textBoxRef = useRef<HTMLInputElement>(null);
    const [options, setOptions] = useState<DropDownSearchOption<Location>[]>([]);

    const onClick = (): void => {
        setIsSearching(true);
        focusTextBox()
    }

    const onBlur = (): void => {
        setIsSearching(false);
    }

    const focusTextBox = (): void => {
        if (textBoxRef.current){
            textBoxRef.current.focus();
        }
    }

    const textboxHidden = useMemo<string>(() => {
        return isSearching ? 'block' : 'hidden';
    }, [isSearching]);

    const updateSearchQuery = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchQuery(e.target.value);
    }

    useEffect(() => {
        if (!isSearching){
            return;
        }

        focusTextBox()
    }, [isSearching]);

    useEffect(() => {
        if (typeof onChange === 'undefined'){
            return;
        }

        onChange(selectedOption.value, name);
    }, [selectedOption]);

    useEffect(() => {
        if (searchQuery.length <= 2){
            setOptions([]);
            return;
        }

        setIsLoading(true);
        const updateOptions = async (): Promise<any> => {
            const res: any = await refetch(searchQuery);
            setOptions(res);
            setIsLoading(false);
        }

        updateOptions();
    }, [searchQuery]);

    return (
        <div className='rounded-lg bg-white'>
            {isSearching ? (
                <div className='flex items-center gap-2 px-2 py-1 border border-slate-300
                    rounded-lg relative'>
                    <BiSearch className=' text-slate-500' />
                    <input type='text' onBlur={onBlur} className={`outline-none w-full ${textboxHidden}`} ref={textBoxRef}
                        value={searchQuery} onChange={updateSearchQuery} />
                    
                    <div className='absolute w-full top-full left-0 grid grid-cols-1 max-h-[200px] overflow-y-auto'>
                        {options.length ? (
                            <>
                                {options.map((e: DropDownSearchOption<Location> ) => {
                                    return (
                                        <button key={`loc-${e.value}`} className='bg-white px-2 py-1 hover:bg-slate-100 text-left'
                                            onClick={() => {setSelectedOption(e)}}>{e.name}</button>
                                    )
                                })}
                            </>
                        ) : (
                            <>
                                {searchQuery.length > 2 && !isLoading && (<p>No results found</p>)}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <> 
                    <div className='flex items-center gap-2 px-2 py-1 border border-slate-300
                        cursor-pointer rounded-lg' onClick={onClick}>
                        {selectedOption?.value ? (
                            <p>{selectedOption.name}</p>
                        ) : (
                            <p className='text-slate-400'>No option selected</p>
                        )}
                    </div>
                </>
            )}
            
        </div>
    )
}