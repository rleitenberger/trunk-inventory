type LoaderSize = 'sm'|'md'|'lg';

export default function Loader({ size='sm' }: {
    size: LoaderSize
}) {
    if (size === 'sm'){
        return (
            <span className="loader-sm"></span>
        )
    }

    const sizeClass: string = `loader-${size}`;

    return (
        <span className={sizeClass}></span>
    )
}