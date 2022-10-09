import { Typography } from "antd";
import "antd/dist/antd.min.css";

const { Paragraph, Title } = Typography;

const InvalidRoutePage = () => {
  return (
    <>
      <Title level={4}>Invalid Route</Title>
      <Paragraph>
        There is no route corresponding to the current URL. You probably followed an invalid link, make sure you are navigating to the correct URL.
      </Paragraph>
      <Paragraph>
        If this message continues to show, contact the application developers, it may be something wrong with the application router configuration.
      </Paragraph>
    </>
  );
};

export default InvalidRoutePage;
