import { useState, useRef, useEffect, useMemo } from 'react';
import { BiChevronDown, BiSearch, BiTransfer } from 'react-icons/bi';
import type { DropDownSearchOption, PaginatedDropDownSearchOptions } from '@/types/DropDownSearchOption';
import Loader from '../Loader';

const MAX_DISPLAY: number = 10;

type PageInfo = {
    endCursor: string
    hasNextPage: boolean
}

export default function DropDownSearch({ refetch, onChange, name, defaultValue }: {
    refetch: (search: string, pageInfo?: PageInfo) => Promise<any>
    onChange: (value: string|null, name: string) => void,
    name: string,
    defaultValue?: DropDownSearchOption
}) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedOption, setSelectedOption] = useState<DropDownSearchOption>(defaultValue === undefined ? {
        name: '',
        value: '',
    } : defaultValue);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const textBoxRef = useRef<HTMLInputElement>(null);
    const [options, setOptions] = useState<DropDownSearchOption[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo>({
        endCursor: '',
        hasNextPage:false
    });

    const onClick = (): void => {
        setIsSearching(true);
        focusTextBox()
    }

    const onFocusOut = () => {
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

        const newPageInfo = {
            endCursor: '',
            hasNextPage: false
        };

        setIsLoading(true);
        setPageInfo(newPageInfo);
        const updateOptions = async (): Promise<any> => {
            const res: any = await refetch(searchQuery, newPageInfo);

            setIsLoading(false);

            if ('nodes' in res){
                setOptions(res.nodes);
                setPageInfo(res.pageInfo);
                return;
            }

            setOptions(res);
        }

        updateOptions();
    }, [searchQuery]);

    useEffect(() => {
        if (!defaultValue){
            return;
        }

        if (typeof onChange === 'undefined'){
            return;
        }

        onChange(defaultValue.value, name);
    }, []);

    const setOption = (e: DropDownSearchOption): void => {
        setSelectedOption(e);
        setIsSearching(false);
    }

    return (
        <div className='rounded-lg bg-white'>
            {isSearching ? (
                <div className='flex items-center gap-2 px-2 py-1 border border-slate-300
                    rounded-lg relative'>
                    <BiSearch className=' text-slate-500' />
                    <input type='text' className={`outline-none w-full text-sm ${textboxHidden}`} ref={textBoxRef}
                        value={searchQuery} onChange={updateSearchQuery} onBlur={onFocusOut} />
                    
                    {isLoading && (
                        <Loader size='sm' />
                    )}
                    
                    <div className='absolute w-full top-full left-0 grid grid-cols-1 max-h-[200px] overflow-y-auto mt-2 rounded-lg
                        --nice-scroll shadow-md'>
                        {options.length ? (
                            <>
                                {options.map((e: DropDownSearchOption ) => {
                                    return (
                                        <button key={`loc-${e.value}`} className='bg-white px-2 py-1 hover:bg-slate-100 text-left text-sm'
                                            onClick={() => {setOption(e)}} onMouseDown={(e) => {
                                                e.preventDefault();
                                            }}>{e.name}</button>
                                    )
                                })}
                            </>
                        ) : (
                            <>
                                {searchQuery.length > 2 && !isLoading && (<div className='bg-white px-2 py-1 text-sm'>No results found</div>)}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <> 
                    <div className='flex items-center gap-2 px-2 py-1 border border-slate-300
                        cursor-pointer rounded-lg text-sm' onClick={onClick}>
                        {selectedOption?.value ? (
                            <> 
                                <p className=''>{selectedOption.name}</p>
                            </>
                        ) : (
                            <p className='text-slate-400'>No option selected</p>
                        )}
                        <BiChevronDown className='ml-auto' />
                    </div>
                </>
            )}
            
        </div>
    )
}