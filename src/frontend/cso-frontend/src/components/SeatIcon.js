export default function SeatIcon({ className = "", title, ...props }) {
    return (
        <svg
            className={`seat ${className}`}
            viewBox="0 0 24 24"
            role="img"
            aria-label={title}
            {...props}
        >
            {title && <title>{title}</title>}
            <path d="M7 3h10v8h2a2 2 0 0 1 2 2v6h-2v-6h-2v6H7v-6H5v6H3v-6a2 2 0 0 1 2-2h2V3z"/>
        </svg>
    );
}
