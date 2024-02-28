import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { BiChevronDown, BiSearch, BiTransfer, BiX } from 'react-icons/bi';
import type { DropDownSearchOption, PaginatedDropDownSearchOptions } from '@/types/DropDownSearchOption';
import Loader from '../Loader';
import OutsideClickHandler from '../OutsideClickHandler';
import { PageInfo } from '@/types/paginationTypes';
import { title } from 'process';

const MAX_DISPLAY: number = 10;

export default function DropDownSearch({ refetch, onChange, name, defaultValue, fieldName=undefined }: {
    refetch: (search: string, pageInfo?: PageInfo) => Promise<any>
    onChange: (value: string|null, name: string) => void,
    name: string,
    defaultValue?: DropDownSearchOption
    fieldName?: string
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

    const canLoadMore = useMemo(() => {
        return pageInfo?.hasNextPage;
    }, [pageInfo]);

    const [showWhenEmpty, setShowWhenEmpty] = useState<DropDownSearchOption[]>([]);
    const [showWhenEmptyPageInfo, setShowWhenEmptyPageInfo] = useState<PageInfo>({
        endCursor: null,
        hasNextPage: false
    });
    const [focusedItem, setFocusedItem] = useState<string>('');
    const [isLoadingScroll, setIsLoadingScroll] = useState<boolean>(false);
    const scrollRef = useRef<HTMLInputElement>(null);
    const loaderRef = useRef<HTMLDivElement>(null);

    const checkScrollEnd = async () => {
        if (!scrollRef.current){
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight) {

            setIsLoadingScroll(true);
            await onReachedScrollEnd();
            setIsLoadingScroll(false);
        }
    }

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement){
            return;
        }

        scrollElement.addEventListener('scroll', checkScrollEnd);

        return () => {
            scrollElement.removeEventListener('scroll', checkScrollEnd);
        }
    }, [checkScrollEnd, scrollRef.current]);

    async function fetchEmpty() {
        return;


        if (!showWhenEmpty.length) {
            const opts = await refetch('', pageInfo);

            if ('nodes' in opts){
                setShowWhenEmpty(opts.nodes);
                setShowWhenEmptyPageInfo(opts.pageInfo);
                setOptions(opts.nodes);
                setPageInfo(opts.pageInfo);
                return;
            }

            setShowWhenEmpty(opts);
            setOptions(opts);
        } else {
            setOptions(showWhenEmpty);
        }
    }

    const onClick = (): void => {
        setIsSearching(true);
        focusTextBox();
    }

    const focusTextBox = (): void => {
        if (textBoxRef.current){
            textBoxRef.current.focus();
        }
    }

    const elementKeyDown = (e: React.KeyboardEvent<HTMLElement>): void => {
        if (e.key === 'ArrowDown'){
            e.preventDefault();
            const index = options.map(e => e.value).indexOf(focusedItem);
            if (index >= options.length - 1){
                return;
            }

            const newOption = options[index + 1].value;
            setFocusedItem(newOption);
            document.getElementById(`opt-${newOption}`)?.scrollIntoView();
        }else if (e.key === 'ArrowUp'){
            e.preventDefault();
            const index = options.map(e => e.value).indexOf(focusedItem);
            if (index === 0){
                return;
            }

            const newOption = options[index - 1].value;
            setFocusedItem(newOption);
            document.getElementById(`opt-${newOption}`)?.scrollIntoView();
        }else if (e.key === 'Enter'){
            const index = options.map(e => e.value).indexOf(focusedItem);
            setOption(options[index]);
        }
    }

    const textboxHidden = useMemo<string>(() => {
        return isSearching ? 'block' : 'hidden';
    }, [isSearching]);

    const updateSearchQuery = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchQuery(e.target.value);
    }


    const clearSelectedOption = (): void => {
        setSearchQuery('');
        setSelectedOption({
            name: '',
            value: ''
        });
    }

    useEffect(() => {
        if (!isSearching){
            return;
        }

        focusTextBox()
    }, [isSearching]);

    const updateSelectedOption = (e: any): void => {
        setSelectedOption(e);
        onChange(e.value, name);
    }
    

    useEffect(() => {
        if (searchQuery.length <= 2){
            setOptions([]);
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
        if (!options?.length) {
            return;
        }

        if (typeof document === 'undefined'){
            return;
        }

        setFocusedItem(options[0].value);
    }, [options]);

    const setOption = (e: DropDownSearchOption): void => {
        updateSelectedOption(e);
        setIsSearching(false);
    }

    const onFocusLost = () => {
        document.body.focus();
        setIsSearching(false);
    }

    async function onReachedScrollEnd() {
        if (!pageInfo.hasNextPage){
            return;
        }

        const opts = await refetch(searchQuery, pageInfo);

        if ('nodes' in opts){
            setOptions([
                ...options,
                ...opts.nodes
            ]);
            setPageInfo(opts.pageInfo);
            return;
        }

        setOptions([
            ...options,
            ...opts
        ]);
    }

    useEffect(() => {
        if (!isLoading){
            return;
        }

        if (!loaderRef.current){
            return;
        }
        
        loaderRef.current.scrollIntoView();
    }, [isLoadingScroll]);

    return (
        <div className='rounded-lg bg-white'>
            {isSearching ? (
                <OutsideClickHandler onOutsideClick={onFocusLost}>
                    <div className='flex items-center gap-2 px-2 py-1 border border-slate-300
                        rounded-lg relative'>
                        <BiSearch className=' text-slate-500' />
                        <input type='text' className={`outline-none w-full text-sm ${textboxHidden}`} ref={textBoxRef}
                            value={searchQuery} onChange={updateSearchQuery} onKeyDown={elementKeyDown}  />
                        
                        {isLoading && (
                            <Loader size='sm' />
                        )}
                        
                        <div className='absolute w-full top-full left-0 grid grid-cols-1'>
                            {options.length ? (
                                <div className='mt-2 rounded-lg --nice-scroll shadow-md border border-slate-300 max-h-[200px]
                                overflow-y-auto' ref={scrollRef}>
                                    {options?.map((e: DropDownSearchOption ) => {
                                        const isFocused = focusedItem === e.value ? 'bg-slate-100' : 'bg-white';
                                        return (
                                            <button key={`loc-${e.value}`} className={`${isFocused} px-2 py-1 hover:bg-slate-100 text-left text-sm w-full`}
                                                onClick={() => {setOption(e)}} onMouseDown={(e) => {
                                                    e.preventDefault();
                                                }} id={`opt-${e.value}`} title="Select option">{e.name}</button>
                                        )
                                    })}
                                    {isLoadingScroll && (
                                        <div className="bg-white flex items-center justify-center p-1" ref={loaderRef}>
                                            <Loader size="sm" />
                                        </div>
                                    )}
                                    {!pageInfo.hasNextPage && (
                                        <div className='text-center bg-white py-1 text-sm text-gray-500 font-medium'>
                                            <label>End of results</label>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {searchQuery.length > 2 && !isLoading && (<div className='bg-white px-2 py-1 text-sm'>No results found</div>)}
                                </>
                            )}
                        </div>
                    </div>
                </OutsideClickHandler>
                
            ) : (
                <> 
                    <div className='flex items-center gap-2 px-2 py-1 border border-slate-300
                        cursor-pointer rounded-lg text-sm' onClick={onClick}>
                        {selectedOption?.value ? (
                            <> 
                                <button className='bg-gray-100 px-2 rounded-sm flex items-center gap-2'
                                    onClick={clearSelectedOption} title="Clear selection">
                                    {selectedOption.name}
                                    <BiX className='text-lg text-red-600' />
                                </button>
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