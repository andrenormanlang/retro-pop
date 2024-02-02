export type MenuType = {
	name: string;
	submenu?: SubmenuType[];
}

export type SubmenuType =  {
	name: string;
	href?: string;
	submenu?: SubmenuType[];
  }
