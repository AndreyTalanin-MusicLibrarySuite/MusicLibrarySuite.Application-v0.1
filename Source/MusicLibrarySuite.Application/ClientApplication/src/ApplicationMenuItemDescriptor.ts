export default interface ApplicationMenuItemDescriptor {
  key: string;
  text: string;
  items?: ApplicationMenuItemDescriptor[];
  type: "item" | "menu";
}
