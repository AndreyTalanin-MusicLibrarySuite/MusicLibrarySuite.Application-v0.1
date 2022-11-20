export default interface ApplicationPageDescriptor {
  key: string;
  path: string;
  name: string;
  componentFactory?: () => React.ReactNode;
}
