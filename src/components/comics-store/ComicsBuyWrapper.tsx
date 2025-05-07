"use client";

import dynamic from "next/dynamic";

const ComicsBuy = dynamic(() => import("@/app/comics-store/buy/page"), {
	ssr: false,
});

const ComicsBuyWrapper = () => {
	return <ComicsBuy />;
};

export default ComicsBuyWrapper;
