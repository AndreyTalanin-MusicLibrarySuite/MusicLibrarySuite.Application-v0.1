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

export interface ReleaseMediaRelationship {
  name: string;
  description?: string;
  releaseMediaId: string;
  releaseMediaTitle: string;
  releaseMediaHref?: string;
  releaseMediaNumber: number;
  dependentEntityId: string;
  dependentEntityName: string;
  dependentEntityHref?: string;
}

export interface ReleaseMediaRelationshipTableProps {
  dependentEntityColumnName: string;
  releaseMediaRelationships: ReleaseMediaRelationship[];
  loading?: boolean;
  editMode?: boolean;
  reorderMode?: boolean;
  onReleaseMediaRelationshipEdit?: (releaseMediaRelationship: ReleaseMediaRelationship) => void;
  onReleaseMediaRelationshipDelete?: (releaseMediaRelationship: ReleaseMediaRelationship) => void;
  onReleaseMediaRelationshipsChange?: (releaseMediaRelationships: ReleaseMediaRelationship[]) => void;
}

const ReleaseMediaRelationshipTable = ({
  dependentEntityColumnName,
  releaseMediaRelationships,
  loading,
  editMode,
  reorderMode,
  onReleaseMediaRelationshipEdit,
  onReleaseMediaRelationshipDelete,
  onReleaseMediaRelationshipsChange,
}: ReleaseMediaRelationshipTableProps) => {
  const columns = [
    {
      key: "releaseMediaNumber",
      title: "Media #",
      dataIndex: "releaseMediaNumber",
    },
    {
      key: "releaseMediaTitle",
      title: "Media Title",
      dataIndex: "releaseMediaTitle",
      render: (value: string, { releaseMediaHref }: ReleaseMediaRelationship) =>
        releaseMediaHref ? <Typography.Link href={releaseMediaHref}>{value}</Typography.Link> : value,
    },
    {
      key: "dependentEntityName",
      title: dependentEntityColumnName,
      dataIndex: "dependentEntityName",
      render: (value: string, { dependentEntityHref }: ReleaseMediaRelationship) =>
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
      render: (_: string, releaseMediaRelationship: ReleaseMediaRelationship) => (
        <Space wrap>
          <Button onClick={onReleaseMediaRelationshipEdit ? () => onReleaseMediaRelationshipEdit(releaseMediaRelationship) : undefined}>
            <EditOutlined /> Edit
          </Button>
          <Button danger onClick={onReleaseMediaRelationshipDelete ? () => onReleaseMediaRelationshipDelete(releaseMediaRelationship) : undefined}>
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

  const getEntityRelationshipKey = ({ releaseMediaId, dependentEntityId }: ReleaseMediaRelationship) => {
    return `(${releaseMediaId}, ${dependentEntityId})`;
  };

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (onReleaseMediaRelationshipsChange) {
        const row = releaseMediaRelationships[dragIndex];
        const newReleaseMediaRelationships = [...releaseMediaRelationships];
        newReleaseMediaRelationships.splice(dragIndex, 1);
        newReleaseMediaRelationships.splice(hoverIndex, 0, row);
        onReleaseMediaRelationshipsChange(newReleaseMediaRelationships);
      }
    },
    [releaseMediaRelationships, onReleaseMediaRelationshipsChange]
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Table
        size="small"
        columns={editMode ? editModeColumns : columns}
        components={editMode || reorderMode ? components : undefined}
        pagination={editMode || reorderMode ? { showSizeChanger: true } : undefined}
        loading={loading}
        dataSource={releaseMediaRelationships}
        rowKey={getEntityRelationshipKey}
        onRow={editMode || reorderMode ? (_, index) => ({ index, moveRow } as React.HTMLAttributes<any>) : undefined}
      />
    </DndProvider>
  );
};

export default ReleaseMediaRelationshipTable;
