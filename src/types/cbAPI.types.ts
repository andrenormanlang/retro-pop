export type ComicCover = {
	title: string;
	coverPage: string;
	description: string;
	information: {
	  ImageFormat: string;
	  Size: string;
	  Year: string;
	};
	downloadLinks: {
	  DOWNLOADNOW: string;
	  MEDIAFIRE: string;
	  READONLINE: string;
	  UFILE: string;
	  ZIPPYSHARE: string;
	};
  }

  interface HomePageState {
	cover: ComicCover | null;
	isLoading: boolean;
  }
