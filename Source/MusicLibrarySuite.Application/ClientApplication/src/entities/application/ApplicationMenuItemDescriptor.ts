export default interface ApplicationMenuItemDescriptor {
  key: string;
  label: string;
  items?: ApplicationMenuItemDescriptor[];
  type: "item" | "menu";
}
