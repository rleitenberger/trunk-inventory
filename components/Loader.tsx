export default function Loader({ size='sm' }) {
    if (size === 'sm'){
        return (
            <span className="loader-sm"></span>
        )
    }

    const sizeClass = `loader-${size}`;

    return (
        <span className={sizeClass}></span>
    )
}