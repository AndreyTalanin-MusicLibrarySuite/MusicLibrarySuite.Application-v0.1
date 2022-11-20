import { Typography } from "antd";
import "antd/dist/antd.min.css";

const InvalidRoutePage = () => {
  return (
    <>
      <Typography.Title level={4}>Invalid Route</Typography.Title>
      <Typography.Paragraph>
        There is no route corresponding to the current URL. You probably followed an invalid link, make sure you are navigating to the correct URL.
      </Typography.Paragraph>
      <Typography.Paragraph>
        If this message continues to show, contact the application developers, it may be something wrong with the application router configuration.
      </Typography.Paragraph>
    </>
  );
};

export default InvalidRoutePage;
