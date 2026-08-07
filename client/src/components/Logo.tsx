import { Link } from 'react-router';

export default function Logo() {
    return (
        <Link
            to="/"
            className="inline-flex items-center gap-3 group focus:outline-none select-none"
        >
            {/* Icon Badge - 3D Neubrutalism Block */}
            <div className="relative">
                {/* Cast Shadow */}
                <div className="absolute inset-0 bg-slate-200 translate-x-1 translate-y-1 rounded-xl" />

                {/* Badge Face */}
                <div className="relative w-11 h-11 bg-[#F9D601] border-2 border-black rounded-xl flex items-center justify-center border-b-4 border-r-4 border-[#DDAF02] group-hover:bg-[#ffe12c] active:translate-x-0.5 active:translate-y-0.5 transition-all">
                    <span className="text-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200">
                        🎨
                    </span>
                </div>
            </div>

            {/* Brand Text */}
            <div className="flex flex-col">
                <span className="font-black text-2xl tracking-wider text-slate-900 group-hover:text-[#DDAF02] transition-colors uppercase leading-none">
                    SKETCH<span className="text-[#F9D601] group-hover:text-slate-900 drop-shadow-[1px_1px_0px_#000]">ARENA</span>
                </span>
            </div>
        </Link>
    );
}