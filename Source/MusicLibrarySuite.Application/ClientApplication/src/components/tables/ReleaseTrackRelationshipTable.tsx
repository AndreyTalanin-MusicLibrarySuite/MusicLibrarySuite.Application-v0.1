import { Button, Space, Table, Typography } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./EntityRelationshipTable.module.css";
import "antd/dist/antd.min.css";

const draggableHTMLTableRowElementType = "DraggableHTMLTableRowElement";

interface DraggableHTMLTableRowElementProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableHTMLTableRowElement = ({ index, moveRow, className, style, ...restProps }: DraggableHTMLTableRowElementProps) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: draggableHTMLTableRowElementType,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      } else {
        return {
          isOver: monitor.isOver(),
          dropClassName: ` ${styles.dropOver}`,
        };
      }
    },
    drop: (item: { index: number }) => {
      moveRow(item.index, index);
    },
  });

  const [, drag] = useDrag({
    type: draggableHTMLTableRowElementType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drop(drag(ref));

  return <tr ref={ref} className={`${className}${isOver ? dropClassName : ""}`} style={{ cursor: "move", ...style }} {...restProps} />;
};

export interface ReleaseTrackRelationship {
  name: string;
  description?: string;
  releaseTrackId: string;
  releaseTrackTitle: string;
  releaseTrackHref?: string;
  releaseTrackNumber: number;
  releaseMediaNumber: number;
  dependentEntityId: string;
  dependentEntityName: string;
  dependentEntityHref?: string;
}

export interface ReleaseTrackRelationshipTableProps {
  dependentEntityColumnName: string;
  releaseTrackRelationships: ReleaseTrackRelationship[];
  loading?: boolean;
  editMode?: boolean;
  reorderMode?: boolean;
  onReleaseTrackRelationshipEdit?: (releaseTrackRelationship: ReleaseTrackRelationship) => void;
  onReleaseTrackRelationshipDelete?: (releaseTrackRelationship: ReleaseTrackRelationship) => void;
  onReleaseTrackRelationshipsChange?: (releaseTrackRelationships: ReleaseTrackRelationship[]) => void;
}

const ReleaseTrackRelationshipTable = ({
  dependentEntityColumnName,
  releaseTrackRelationships,
  loading,
  editMode,
  reorderMode,
  onReleaseTrackRelationshipEdit,
  onReleaseTrackRelationshipDelete,
  onReleaseTrackRelationshipsChange,
}: ReleaseTrackRelationshipTableProps) => {
  const columns = [
    {
      key: "releaseTrackNumber",
      title: "Track #",
      dataIndex: "releaseTrackNumber",
    },
    {
      key: "releaseMediaNumber",
      title: "Media #",
      dataIndex: "releaseMediaNumber",
    },
    {
      key: "releaseTrackTitle",
      title: "Track Title",
      dataIndex: "releaseTrackTitle",
      render: (value: string, { releaseTrackHref }: ReleaseTrackRelationship) =>
        releaseTrackHref ? <Typography.Link href={releaseTrackHref}>{value}</Typography.Link> : value,
    },
    {
      key: "dependentEntityName",
      title: dependentEntityColumnName,
      dataIndex: "dependentEntityName",
      render: (value: string, { dependentEntityHref }: ReleaseTrackRelationship) =>
        dependentEntityHref ? <Typography.Link href={dependentEntityHref}>{value}</Typography.Link> : value,
    },
    {
      key: "name",
      title: "Relationship Name",
      dataIndex: "name",
    },
    {
      key: "description",
      title: "Relationship Description",
      dataIndex: "description",
    },
  ];

  const editModeColumns = [
    ...columns,
    {
      key: "action",
      title: "Action",
      render: (_: string, releaseTrackRelationship: ReleaseTrackRelationship) => (
        <Space wrap>
          <Button onClick={onReleaseTrackRelationshipEdit ? () => onReleaseTrackRelationshipEdit(releaseTrackRelationship) : undefined}>
            <EditOutlined /> Edit
          </Button>
          <Button danger onClick={onReleaseTrackRelationshipDelete ? () => onReleaseTrackRelationshipDelete(releaseTrackRelationship) : undefined}>
            <DeleteOutlined /> Delete
          </Button>
        </Space>
      ),
    },
  ];

  const components = {
    body: {
      row: DraggableHTMLTableRowElement,
    },
  };

  const getEntityRelationshipKey = ({ releaseTrackId, dependentEntityId }: ReleaseTrackRelationship) => {
    return `(${releaseTrackId}, ${dependentEntityId})`;
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (onReleaseTrackRelationshipsChange) {
        const row = releaseTrackRelationships[dragIndex];
        const newReleaseTrackRelationships = [...releaseTrackRelationships];
        newReleaseTrackRelationships.splice(dragIndex, 1);
        newReleaseTrackRelationships.splice(hoverIndex, 0, row);
        onReleaseTrackRelationshipsChange(newReleaseTrackRelationships);
      }
    },
    [releaseTrackRelationships, onReleaseTrackRelationshipsChange]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Table
        size="small"
        columns={editMode ? editModeColumns : columns}
        components={editMode || reorderMode ? components : undefined}
        pagination={editMode || reorderMode ? { showSizeChanger: true } : undefined}
        loading={loading}
        dataSource={releaseTrackRelationships}
        rowKey={getEntityRelationshipKey}
        onRow={editMode || reorderMode ? (_, index) => ({ index, moveRow } as React.HTMLAttributes<any>) : undefined}
      />
    </DndProvider>
  );
};

export default ReleaseTrackRelationshipTable;
