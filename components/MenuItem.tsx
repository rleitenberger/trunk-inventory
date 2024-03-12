import Link from "next/link"
import { IconType } from "react-icons"

const MenuItem = ({ href, Icon, text, textClass }: {
    href: string
    Icon: IconType
    text: string
    textClass?: string
}) => {
    return (
        <div className='rounded-lg transition-all duration-200 hover:bg-white/20'>
            <Link href={href} className='p-3 flex items-center gap-3 text-main-bg sm:justify-center md:justify-normal'>
                <div className='nav-icon' title={text}>
                    <Icon className='text-xl mx-auto' />
                </div>
                <p className={`${textClass ? textClass : ''} font-medium text-sm`}>{text}</p>
            </Link>
        </div>
    )
}

export default MenuItem