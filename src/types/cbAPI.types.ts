// export type ComicBooksAPI = {
// 	title: string;
// 	coverPage: string;
// 	description: string;
// 	information: {
// 	  ImageFormat: string;
// 	  Size: string;
// 	  Year: string;
// 	};
// 	downloadLinks: {
// 	  DOWNLOADNOW: string;
// 	  MEDIAFIRE: string;
// 	  READONLINE: string;
// 	  UFILE: string;
// 	  ZIPPYSHARE: string;
// 	};
//   }


export type ComicBooksAPI = {
	title: string;
	coverPage: string;
	description: string;
	information: {
	  Year: string;
	  Size: string;
	};
	downloadLinks: {
	  [key: string]: string;
	};
  };

  export type ComicDownloadLinks = {
	[key: string]: string;
  };
