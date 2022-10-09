import { Typography } from "antd";
import "antd/dist/antd.min.css";

const { Link, Paragraph, Title } = Typography;

const HomePage = () => {
  const createLink = (text: string, href: string) => {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {text}
      </Link>
    );
  };

  return (
    <>
      <Title level={4}>Andrey Talanin's Music Library Suite</Title>
      <Paragraph>A set of tools designed to help with local music library management.</Paragraph>

      <Title level={5}>Project Links</Title>
      {createLink("GitHub-hosted project's ogranization.", "https://github.com/AndreyTalanin-MusicLibrarySuite")}

      <Title level={5}>Technology Stack</Title>
      <Paragraph>The project uses the following technologies and frameworks:</Paragraph>
      <Paragraph>
        <ul>
          <li>
            {createLink("C#", "https://learn.microsoft.com/en-us/dotnet/csharp/")} is a modern general-purpose programming language for cross-platform
            server-side code.
          </li>
          <li>
            {createLink("ASP.NET Core", "https://learn.microsoft.com/en-us/aspnet/core/")} is a framework providing a cross-platform web server with rich
            capabilities and extensibility options.
          </li>
          <li>{createLink("TypeScript", "https://www.typescriptlang.org/")} is a strongly-typed programming language for client-side code.</li>
          <li>{createLink("React", "https://reactjs.org/")} is a client-side single-page application framework.</li>
          <li>{createLink("Ant Design", "https://ant.design/")} is a UI component framework providing a design system.</li>
        </ul>
      </Paragraph>
    </>
  );
};

export default HomePage;
